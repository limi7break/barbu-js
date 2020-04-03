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

var users = {}

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
    var id = uuid.v4()
    var username = req.body.username

    if (!username || username.length > 16 || _.includes(_.values(users), username)) {
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
require('./players')
require('./contracts')

class Room {
    constructor (name) {
        this.name = name
        this.started = false
        
        this.players = []
        this.contract = null
        
        this.history = _.times(4, () => [0])
        this.dealer = null
        this.dealerDoubled = _.times(4, () => 0)
    }
}

var rooms = {}

async function startGame (room) {
    room.started = true
    room.dealer = 0
    
    for (i in _.range(room.players.length)) {
        
        broadcast(room.players, 'dealerDoubled', room.dealerDoubled)
        
        for (j in _.range(7)) {
            
            var scores = await playContract(room)
            broadcast(room.players, 'contractScores', scores)
            
            _.each(scores, (score, playerIndex) => {
                room.history[playerIndex].push(room.history[playerIndex].slice(-1)[0] + score)  
            })
            broadcast(room.players, 'history', room.history)

            _.each(room.players, (player, playerIndex) => player.score += scores[playerIndex])
            broadcast(room.players, 'totalScores', _.map(room.players, 'score'))
            
            broadcast(room.players, 'resetTable')
            broadcast(room.players, 'matrix', _.times(4, () => _.times(4, () => 0)))
        
        }
        
        room.dealer = room.dealer + 1
        broadcast(room.players, 'dealer', room.dealer)
        broadcast(room.players, 'playedContracts', _.times(7, () => false))
    
    }

    broadcast(room.players, 'end')
}

async function playContract (room) {

    var deck = new Deck()

    // Distribute cards and send hand to players
    room.players = _.map(room.players, player => _.assign(player, { hand: _.sortBy(deck.draw(13)) }))
    _.map(room.players, player => player.socket.emit('hand', player.hand))

    // Ask dealer to choose the contract
    do {
        var response = await new Promise((resolve, reject) =>
            room.players[room.dealer].socket.emit('chooseContract', response => {
                if (response === undefined) {
                    resolve(response)
                    return response
                }

                room.contract = createContract(response)
                broadcast(room.players, 'contract', response)
                
                room.players[room.dealer].playedContracts[response] = true
                broadcast(room.players, 'playedContracts', room.players[room.dealer].playedContracts)
                
                resolve(response)
            })
        )
    } while (response === undefined)

    if (room.contract.contract == 0) {
        // Atout: ask dealer to choose the trump suit
        do {
            var response = await new Promise((resolve, reject) => 
                room.players[room.dealer].socket.emit('chooseTrumpSuit', response => {
                    if (response === undefined) {
                        resolve(response)
                        return response
                    }

                    room.contract.trumpSuit = response
                    room.contract.startingValue = null
                    broadcast(room.players, 'trumpSuit', response)
                    broadcast(room.players, 'startingValue', null)
                    resolve(response)
                })
            )
        } while (response === undefined)
    } else if (room.contract.contract == 6) {
        // Domino: ask dealer to choose the starting value
        do {
            var response = await new Promise((resolve, reject) => 
                room.players[room.dealer].socket.emit('chooseStartingValue', response => {
                    if (response === undefined) {
                        resolve(response)
                        return response
                    }

                    room.contract.trumpSuit = null
                    room.contract.startingValue = response
                    broadcast(room.players, 'trumpSuit', null)
                    broadcast(room.players, 'startingValue', response)
                    resolve(response)
                })
            )
        } while (response === undefined)
        
    } else {
        room.contract.trumpSuit = null
        room.contract.startingValue = null
        broadcast(room.players, 'trumpSuit', null)
        broadcast(room.players, 'startingValue', null)
    }

    // Doubling phase
    broadcast(room.players, 'matrix', room.contract.matrix)
    room.contract.currentPlayer = (room.dealer + 1) % 4

    for (i in _.range(4)) {
        do {
            var response = await new Promise((resolve, reject) => 
                room.players[room.contract.currentPlayer].socket.emit('chooseDoubling', response => {
                    if (response === undefined) {
                        resolve(response)
                        return response
                    }

                    room.contract.matrix[room.contract.currentPlayer] = response
                    
                    if (response[room.dealer]) {
                        room.dealerDoubled[room.contract.currentPlayer] += 1
                        broadcast(room.players, 'dealerDoubled', room.dealerDoubled)
                    }

                    broadcast(room.players, 'matrix', room.contract.matrix)
                    resolve(response)
                })
            )
        } while (response === undefined)

        room.contract.currentPlayer = (room.contract.currentPlayer + 1) % 4
    }

    // Redoubling phase
    for (i in _.range(4)) {
        do {
            var response = await new Promise((resolve, reject) => 
                room.players[room.contract.currentPlayer].socket.emit('chooseRedoubling', response => {
                    if (response === undefined) {
                        resolve(response)
                        return response
                    }
                    
                    room.contract.matrix[room.contract.currentPlayer] = response
                    broadcast(room.players, 'matrix', room.contract.matrix)
                    resolve(response)
                })
            )
        } while (response === undefined)

        room.contract.currentPlayer = (room.contract.currentPlayer + 1) % 4
    }

    room.contract.firstPlayer   = room.dealer
    room.contract.currentPlayer = room.dealer

    var scores = await room.contract.play(room.players)

    // Calculate doubling
    var adjusted = [...scores]

    _.each(scores, (score, playerIndex) => {
        var others = _.filter(_.range(4), n => n != playerIndex)
        _.each(others, otherIndex => {
            var value = Math.max(
                room.contract.matrix[playerIndex][otherIndex],
                room.contract.matrix[otherIndex][playerIndex]
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

function getRoom (username) {
    return _.find(rooms, room => _.find(room.players, ['username', username]))
}

function getPlayer (username) {
    return _.find(getRoom(username).players, ['username', username])
}

function init (username, socket) {
    var room = getRoom(username)
    var player = getPlayer(username)

    var acks = player.socket.acks
    _.assign(player, { socket: socket })
    _.map(acks, (ack, index) => ack(undefined))

    socket.emit('init', {
        room: room.name,

        players: _.map(room.players, 'username'),
        scores: _.map(room.players, 'score'),
        history: room.history,
        me: _.findIndex(room.players, ['username', username]),

        dealer: room.dealer,
        dealerDoubled: room.dealerDoubled,

        contract: room.contract ? room.contract.contract : null,
        matrix: room.contract ? room.contract.matrix : _.times(4, () => _.times(4, () => 0)),
        firstPlayer: room.contract ? room.contract.firstPlayer : null,
        currentPlayer: room.contract ? room.contract.currentPlayer : null,
        trickCards: room.contract ? room.contract.trickCards : [],
        
        trumpSuit: room.contract ? room.contract.trumpSuit : null,
        
        startingValue: room.contract ? room.contract.startingValue : null,
        domino: room.contract ? room.contract.domino : {},

        hand: player.hand,
        playedContracts: player.playedContracts
    })
}

io.on('connection', (socket) => {
    var regex = /barbu=([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})/i
    var match = regex.exec(socket.handshake.headers.cookie)
    var username = match ? users[match[1]] : null

    if (!username) {
        socket.disconnect()
        return
    }

    console.log(username, 'connected. Socket id:', socket.id)

    socket.emit('rooms', _.mapValues(rooms, room => room.players.length))

    if (getRoom(username)) {
        init(username, socket)
    }

    socket.on('join', name => {
        if (!_.has(rooms, name)) {
            rooms[name] = new Room(name)
        }

        var room = rooms[name]
        var playerIndex = room.players.length
        socket.emit('room', room.name)
        socket.emit('me', playerIndex)
        room.players.push(new HumanPlayer(username, socket))
        broadcast(room.players, 'players', _.map(room.players, 'username'))
        broadcast(room.players, 'connected', username)

        console.log(username, 'joined room', name)

        io.emit('rooms', _.mapValues(rooms, room => room.players.length))

        if (room.players.length == 4 && !room.started) {
            startGame(room)
        }
    })

    socket.on('disconnect', () => {
        let room = getRoom(username)
        
        if (room) {
            broadcast(room.players, 'disconnected', username)
        }
    })
})

app.use(express.static(path.resolve('public')))

server.listen(9000, () => console.log('[*] barbu.js listening on *:9000'))