var _ = require('lodash')
require('./core')

class Game {
    constructor (dealer, game) {
        this.state = {
            scores: _.times(4, () => 0),
            matrix: _.times(4, () => _.times(4, () => 0)),
            dealer: dealer,
            game: game,
            currentPlayer: 0,
            firstPlayer: 0,
            trickCards: [],
            trumpSuit: '',          // for Atout
            startingValue: 0,       // for Domino
            terminal: false,
        }
    }

    validate (card) {
        // Default behavior: enforce following suit if possible.
        
        if (!this.state.trickCards.length) {
            return true
        }

        var trick = _.map([...this.state.trickCards], Card.fromNumber)
        var hand = _.map([...this.players[this.state.currentPlayer].hand], Card.fromNumber)

        if(!_.filter(hand, card => card.suit == trick[0].suit).length) {
            return true
        }

        return Card.fromNumber(card).suit == trick[0].suit
    }

    async play (players) {
        this.players = players
        
        while (!this.state.terminal) {
            _.map(this.players, player => player.socket.emit('currentPlayer', this.state.currentPlayer))
            _.map(this.players, player => player.socket.emit('firstPlayer', this.state.firstPlayer))
            
            var card = await new Promise((resolve, reject) => {
                this.players[this.state.currentPlayer].socket.emit('turn', response => {
                    resolve(response)
                })
            })

            if (this.validate(card)) {
                this.players[this.state.currentPlayer].hand = _.filter(
                    this.players[this.state.currentPlayer].hand, c => c != card
                )
                this.state.trickCards.push(card)
                this.players[this.state.currentPlayer].socket.emit('hand', this.players[this.state.currentPlayer].hand)
                _.map(this.players, player => player.socket.emit('card', this.state.currentPlayer, card))
                
                // If the trick ended:
                //     - Calculate trick winner and update first and current player
                //     - Update scores
                //     - Empty trick cards
                //     - Tell players the trick winner
                if (this.state.trickCards.length == 4) {
                    this.state.currentPlayer = getTrickWinner(this.state.firstPlayer, this.state.trickCards, this.state.trumpSuit)
                    this.state.firstPlayer = this.state.currentPlayer
                    this.updateScores()
                    _.map(this.players, player => player.socket.emit('log',
                        this.players[this.state.currentPlayer].username + ' won the trick!\n'
                    ))
                    _.map(this.players, player => player.socket.emit('log',
                        _.join(_.map(this.state.trickCards, card => Card.fromNumber(card).toString()), ' ')
                    ))
                    this.state.trickCards = []
                } else {
                    this.state.currentPlayer = (this.state.currentPlayer + 1) % 4
                }

                _.map(this.players, player => player.socket.emit('trickCards', this.state.trickCards))

                if (!_.flatten(_.map(players, 'hand')).length) {
                    this.state.terminal = true
                }
            } else {
                this.players[this.state.currentPlayer].socket.emit('log', 'Card not valid.')
            }
        }

        return this.state.scores
    }
}

class Atout extends Game {
    constructor (dealer) {
        super(dealer, 0)
    }

    updateScores () {
        this.state.scores[this.state.currentPlayer] += 5
    }
}

class NoTricks extends Game {
    constructor (dealer) {
        super(dealer, 1)
    }

    updateScores () {
        this.state.scores[this.state.currentPlayer] -= 2
    }
}

class NoHearts extends Game {
    constructor (dealer) {
        super(dealer, 2)
        this.hearts = 0
    }

    validate (card) {
        console.log('played card:', card)
        var trick = _.map([...this.state.trickCards], Card.fromNumber)
        console.log('trick:', trick)
        var hand = _.map([...this.players[this.state.currentPlayer].hand], Card.fromNumber)
        console.log('hand:', hand)

        if (!this.state.trickCards.length) {
            if (_.some(trick, card => card.suit != 'Hearts')) {
                console.log('he has some non hearts')
                return Card.fromNumber(card).suit != 'Hearts'
            }
            console.log('he has only hearts')
            return true
        }

        console.log('trick is not at the beginning')

        if(!_.filter(hand, card => card.suit == trick[0].suit).length) {
            return true
        }

        return Card.fromNumber(card).suit == trick[0].suit
    }

    updateScores () {
        _.each(this.state.trickCards, card => {
            var c = Card.fromNumber(card)
            if (c.suit == 'Hearts') {
                this.hearts += 1
                if (c.value > 7) {
                    this.state.scores[this.state.currentPlayer] -= 4
                } else {
                    this.state.scores[this.state.currentPlayer] -= 2
                }
            }
        })

        if (this.hearts == 13) {
            this.state.terminal = true
        }
    }
}

class NoKingOfHearts extends Game {
    constructor (dealer) {
        super(dealer, 3)
    }

    validate (card) {
        var trick = _.map([...this.state.trickCards], Card.fromNumber)
        var hand = _.map([...this.players[this.state.currentPlayer].hand], Card.fromNumber)

        if (!this.state.trickCards.length) {
            if (_.some(trick, card => card.suit != 'Hearts')) {
                return Card.fromNumber(card).suit != 'Hearts'
            }
            return true
        }

        if(!_.filter(hand, card => card.suit == trick[0].suit).length) {
            return true
        }

        return Card.fromNumber(card).suit == trick[0].suit
    }

    updateScores () {
        _.each(this.state.trickCards, card => {
            if (card == 11) {
                this.state.scores[this.state.currentPlayer] -= 20
                this.state.terminal = true
            }
        })
    }
}

class NoQueens extends Game {
    constructor (dealer) {
        super(dealer, 4)
        this.queens = 0
    }

    updateScores () {
        var queens = [10, 23, 36, 49]

        _.each(this.state.trickCards, card => {
            if (_.includes(queens, card)) {
                this.queens += 1
                this.state.scores[this.state.currentPlayer] -= 6
            }
        })

        if (this.queens == 4) {
            this.state.terminal = true
        }
    }
}

class NoLastTwo extends Game {
    constructor (dealer) {
        super(dealer, 5)
    }

    updateScores () {
        if (_.flatten(_.map(players, 'hand')).length < 8) {
            this.state.scores[this.state.currentPlayer] -= 12
        }
    }
}

class Domino extends Game {
    constructor (dealer) {
        super(dealer, 6)
    }

    updateScores () {
        
    }

    validate (card) {
        
    }

    async play (players) {

    }
}

function createGame (game) {
    const games = [
        Atout,
        NoTricks,
        NoHearts,
        NoKingOfHearts,
        NoQueens,
        NoLastTwo,
        Domino
    ]

    return new games[game]
}

global.Game = Game
global.Atout = Atout
global.NoTricks  = NoTricks  
global.NoHearts = NoHearts
global.NoKingOfHearts = NoKingOfHearts
global.NoQueens = NoQueens
global.NoLastTwo = NoLastTwo
global.Domino = Domino
global.createGame = createGame
