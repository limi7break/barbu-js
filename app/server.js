var path = require('path')
var uuid = require('uuid')
var _ = require('lodash')

var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var cookieParser = require('cookie-parser')
app.use(cookieParser())

var users = {
    'd10cfe44-b43a-4e16-9f61-f369b94492bd': 'admin'
}

app.get('/', (req, res) => {
    if (req.cookies.barbu === undefined) {
        res.sendFile(path.resolve('public/login.html'))
    } else if (users[req.cookies.barbu] === undefined) {
        res.cookie('barbu', '', {
            expires: new Date(2020, 0, 1),
            httpOnly: true
        })
        res.redirect('/')
    } else {
        res.redirect('/barbu')
    }
})

app.get('/barbu', (req, res) => {
    if (req.cookies.barbu === undefined) {
        res.redirect('/')
    } else if (users[req.cookies.barbu] === undefined) {
        res.cookie('barbu', '', {
            expires: new Date(2020, 0, 1),
            httpOnly: true
        })
        res.redirect('/')
    } else {
        res.sendFile(path.resolve('public/barbu.html'))
    }
})

app.post('/login', (req, res) => {
    let id = uuid.v4()
    let username = req.body.username

    if (!username || username.length > 16) {
        res.redirect('/')
    }
    
    users[id] = username

    res.cookie('barbu', id, {
        maxAge: 2147483647,
        httpOnly: true
    })

    res.redirect('/barbu')
})



require('./core')
require('./games')

var players = []

var started = false

// Game logic

async function start () {
    started = true

    // TODO: random starting dealer
    var dealer = 0
    var scores = _.times(4, () => 0)
    
    for (i in _.range(players.length)) {
        
        var dealerDoubled = _.times(4, () => 0)
        broadcast(players, 'dealerDoubled', dealerDoubled)
        
        for (j in _.range(7)) {
            
            scores = await play(dealer, dealerDoubled)
            
            _.each(players, (player, playerIndex) => player.score += scores[playerIndex])
            broadcast(players, 'gameScores', scores)
            broadcast(players, 'totalScores', _.map(players, 'score'))
            broadcast(players, 'resetTable')
        
        }
        
        dealer = dealer + 1
        broadcast(players, 'dealer', dealer)
        broadcast(players, 'playedGames', _.times(7, () => false))
    
    }

    io.emit('end')

    started = false
}

async function play (dealer, dealerDoubled) {

    var game = null
    var deck = new Deck()

    // Distribute cards and send hand to players
    players = _.map(players, player => _.assign(player, { hand: _.sortBy(deck.draw(13)) }))
    _.map(players, player => player.socket.emit('hand', player.hand))

    // Ask dealer to choose the game
    await new Promise((resolve, reject) => 
        players[dealer].socket.emit('chooseGame', response => {
            game = createGame(response)
            io.emit('game', response)
            players[dealer].playedGames[response] = true
            broadcast(players, 'playedGames', players[dealer].playedGames)
            resolve()
        })
    )

    if (game.state.game == 0) {
        // Atout: ask dealer to choose the trump suit
        await new Promise((resolve, reject) => 
            players[dealer].socket.emit('chooseTrumpSuit', response => {
                game.state.trumpSuit = response
                game.state.startingValue = null
                io.emit('trumpSuit', response)
                io.emit('startingValue', null)
                resolve()
            })
        )
    } else if (game.state.game == 6) {
        // Domino: ask dealer to choose the starting value
        await new Promise((resolve, reject) => 
            players[dealer].socket.emit('chooseStartingValue', response => {
                game.state.trumpSuit = null
                game.state.startingValue = response
                io.emit('trumpSuit', null)
                io.emit('startingValue', response)
                resolve()
            })
        )
    } else {
        game.state.trumpSuit = null
        game.state.startingValue = null
        io.emit('trumpSuit', null)
        io.emit('startingValue', null)
    }

    // Doubling phase
    io.emit('matrix', game.state.matrix)
    game.state.currentPlayer = (dealer + 1) % 4

    for (i in _.range(4)) {
        await new Promise((resolve, reject) => 
            players[game.state.currentPlayer].socket.emit('chooseDoubling', response => {
                game.state.matrix[game.state.currentPlayer] = response
                
                if (response[dealer]) {
                    dealerDoubled[game.state.currentPlayer] += 1
                    broadcast(players, 'dealerDoubled', dealerDoubled)
                }

                io.emit('matrix', game.state.matrix)
                resolve()
            })
        )

        game.state.currentPlayer = (game.state.currentPlayer + 1) % 4
    }

    // Redoubling phase
    for (i in _.range(4)) {
        await new Promise((resolve, reject) => 
            players[game.state.currentPlayer].socket.emit('chooseRedoubling', response => {
                game.state.matrix[game.state.currentPlayer] = response
                io.emit('matrix', game.state.matrix)
                resolve()
            })
        )

        game.state.currentPlayer = (game.state.currentPlayer + 1) % 4
    }

    game.state.firstPlayer   = dealer
    game.state.currentPlayer = dealer

    var scores = await game.play(players)

    // Calculate doubling
    var adjusted = [...scores]

    _.each(scores, (score, playerIndex) => {
        var others = _.filter(_.range(4), n => n != playerIndex)
        _.each(others, otherIndex => {
            var value = Math.max(
                game.state.matrix[playerIndex][otherIndex],
                game.state.matrix[otherIndex][playerIndex]
            )
            if (value) {
                var adjustment = value * (scores[playerIndex] - scores[otherIndex])
                adjusted[playerIndex] += adjustment
            }
        })
    })

    return adjusted

}

// Socket event handlers

io.on('connection', (socket) => {
    var regex = /barbu=([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})/i
    var match = regex.exec(socket.handshake.headers.cookie)
    var username = match ? users[match[1]] : null

    if (!username) {
        socket.disconnect()
        return
    }

    io.emit('connected', username)

    console.log(username, 'connected. Socket id:', socket.id)

    var playerIndex = _.findIndex(players, ['username', username])

    if (playerIndex != -1) {
        // Update socket
        _.assign(players[playerIndex], { socket: socket })
    } else {
        // New player
        playerIndex = players.length
        socket.emit('me', playerIndex)
        players.push(new Player(username, socket))
    }

    io.emit('players', _.map(players, 'username'))

    if (players.length == 4 && !started) {
        start()
    }

    socket.on('disconnect', () => {
        io.emit('disconnected', username)
    })
})

app.use(express.static(path.resolve('public')))

server.listen(9000, () => console.log('[*] barbu.js listening on *:9000'))