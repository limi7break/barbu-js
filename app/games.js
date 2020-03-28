var _ = require('lodash')
require('./core')

class Game {
    constructor (dealer, game) {
        this.state = {
            scores: _.times(4, () => 0),
            matrix: _.times(4, () => _.times(4, () => 0)),
            dealer: dealer,
            game: game,
            firstPlayer: 0,
            currentPlayer: 0,
            trickCards: [],
            trumpSuit: null,        // for Atout
            startingValue: null,    // for Domino
            terminal: false,
        }
    }

    validate (card) {
        // Default behavior: enforce following suit if possible.
        
        if (!this.state.trickCards.length) {
            return true
        }

        var trick = _.map(this.state.trickCards, Card.fromNumber)
        var hand = _.map(this.players[this.state.currentPlayer].hand, Card.fromNumber)

        if(!_.filter(hand, card => card.suit == _.first(trick).suit).length) {
            return true
        }

        return Card.fromNumber(card).suit == _.first(trick).suit
    }

    async play (players) {
        this.players = players
        
        while (!this.state.terminal) {
            broadcast(this.players, 'currentPlayer', this.state.currentPlayer)

            // Ask current player for a card
            var playedCard = await new Promise((resolve, reject) => {
                this.players[this.state.currentPlayer].socket.emit('turn', response => {
                    resolve(response)
                })
            })

            // Validate played card
            if (this.validate(playedCard)) {
                
                // Remove played card from the player's hand
                _.remove(this.players[this.state.currentPlayer].hand, card => card == playedCard)
                
                // Put card in the trick cards
                this.state.trickCards.push(playedCard)
                
                // Update player's hand in the client
                this.players[this.state.currentPlayer].socket.emit('hand', this.players[this.state.currentPlayer].hand)

                broadcast(this.players, 'firstPlayer', this.state.firstPlayer)
                broadcast(this.players, 'trickCards', this.state.trickCards)
                
                // Trick ended?
                if (this.state.trickCards.length == 4) {
                    
                    // Calculate trick winner and update first/current player accordingly
                    this.state.firstPlayer = getTrickWinner(this.state.firstPlayer, this.state.trickCards, this.state.trumpSuit)
                    this.state.currentPlayer = this.state.firstPlayer
                    
                    // Update scores based on trick winner and trick cards (game-specific)
                    this.updateScores()
                    
                    broadcast(this.players, 'log', this.players[this.state.currentPlayer].username + ' won the trick!\n')
                    
                    this.state.trickCards = []
                
                } else {
                    this.state.currentPlayer = (this.state.currentPlayer + 1) % 4
                }

                // If everyone has an empty hand, the state is terminal
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
        this.state.hearts = 0
    }

    validate (card) {
        var trick = _.map(this.state.trickCards, Card.fromNumber)
        var hand = _.map(this.players[this.state.currentPlayer].hand, Card.fromNumber)

        if (!this.state.trickCards.length) {
            if (_.some(hand, card => card.suit != 'Hearts')) {
                return Card.fromNumber(card).suit != 'Hearts'
            }
            return true
        }

        if(!_.filter(hand, card => card.suit == _.first(trick).suit).length) {
            return true
        }

        return Card.fromNumber(card).suit == _.first(trick).suit
    }

    updateScores () {
        _.each(_.map(this.state.trickCards, Card.fromNumber), card => {
            if (card.suit == 'Hearts') {
                this.state.hearts += 1
                if (card.value > 7) {
                    this.state.scores[this.state.currentPlayer] -= 4
                } else {
                    this.state.scores[this.state.currentPlayer] -= 2
                }
            }
        })

        if (this.state.hearts == 13) {
            this.state.terminal = true
        }
    }
}

class NoKingOfHearts extends Game {
    constructor (dealer) {
        super(dealer, 3)
    }

    validate (card) {
        var trick = _.map(this.state.trickCards, Card.fromNumber)
        var hand = _.map(this.players[this.state.currentPlayer].hand, Card.fromNumber)

        if (!this.state.trickCards.length) {
            if (_.some(hand, card => card.suit != 'Hearts')) {
                return Card.fromNumber(card).suit != 'Hearts'
            }
            return true
        }

        if(!_.filter(hand, card => card.suit == _.first(trick).suit).length) {
            return true
        }

        return Card.fromNumber(card).suit == _.first(trick).suit
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
        this.state.queens = 0
    }

    updateScores () {
        var queens = [10, 23, 36, 49]

        _.each(this.state.trickCards, card => {
            if (_.includes(queens, card)) {
                this.state.queens += 1
                this.state.scores[this.state.currentPlayer] -= 6
            }
        })

        if (this.state.queens == 4) {
            this.state.terminal = true
        }
    }
}

class NoLastTwo extends Game {
    constructor (dealer) {
        super(dealer, 5)
    }

    updateScores () {
        if (_.flatten(_.map(this.players, 'hand')).length < 8) {
            this.state.scores[this.state.currentPlayer] -= 12
        }
    }
}

class Domino extends Game {
    constructor (dealer) {
        super(dealer, 6)
        this.state.domino = {
            'Hearts': {
                ace: false,
                cards: []
            },
            'Diamonds': {
                ace: false,
                cards: []
            },
            'Clubs': {
                ace: false,
                cards: []
            },
            'Spades': {
                ace: false,
                cards: []
            },
        }
        this.state.points = [45, 20, 10, -10]
    }

    validate (card) {
        var playedCard = Card.fromNumber(card)
        
        if (playedCard.value == this.state.startingValue) {
            return true
        }

        var suitCards = _.map(this.state.domino[playedCard.suit].cards, Card.fromNumber)

        if (playedCard.value == 12) {
            return _.get(_.first(suitCards), 'value') == 0
        }

        if (playedCard.value == 0 && this.state.domino[playedCard.suit].ace) {
            return true
        }

        if ((playedCard.value == _.get(_.first(suitCards), 'value') - 1)
         || (playedCard.value == _.get(_.last(suitCards), 'value') + 1)) {
            return true
        }

        return false
    }

    attachCard (card) {
        var playedCard = Card.fromNumber(card)

        this.state.domino[playedCard.suit].ace = playedCard.value == 12
        
        if (playedCard.value != 12) {
            this.state.domino[playedCard.suit].cards
                = _.chain(this.state.domino[playedCard.suit].cards)
                    .concat(card)
                    .sortBy()
                    .value()
        }
    }

    canPlay (playerIndex) {
        return _.some(
            _.map(this.players[playerIndex].hand, card => this.validate(card)),
            Boolean
        )
    }

    async play (players) {
        this.players = players
        
        // In domino, the first player is the one after the dealer
        this.state.currentPlayer = (this.state.currentPlayer + 1) % 4

        while (!this.state.terminal) {
            broadcast(this.players, 'currentPlayer', this.state.currentPlayer)
            
            // Check if the current player can play a card
            // If they can't, automatically pass the turn
            if (this.canPlay(this.state.currentPlayer)) {

                // Ask current player for a card
                var playedCard = await new Promise((resolve, reject) => {
                    this.players[this.state.currentPlayer].socket.emit('turn', response => {
                        resolve(response)
                    })
                })

                // Validate played card
                if (this.validate(playedCard)) {
                    
                    // Remove played card from the player's hand
                    _.remove(this.players[this.state.currentPlayer].hand, card => card == playedCard)
                    
                    // Attach card to domino
                    this.attachCard(playedCard)
                    
                    // Update player's hand in the client
                    this.players[this.state.currentPlayer].socket.emit('hand', this.players[this.state.currentPlayer].hand)
                    
                    // If the player has an empty hand, give them the highest available score
                    if (!this.players[this.state.currentPlayer].hand.length) {
                        this.state.scores[this.state.currentPlayer] = this.state.points.shift()
                    }

                    this.state.currentPlayer = (this.state.currentPlayer + 1) % 4

                    broadcast(this.players, 'domino', this.state.domino)

                    // If everyone has an empty hand, the state is terminal
                    if (!_.flatten(_.map(players, 'hand')).length) {
                        this.state.terminal = true
                    }
                
                } else {
                    this.players[this.state.currentPlayer].socket.emit('log', 'Card not valid.')
                }

            } else {
                
                _.map(this.players, player => player.socket.emit('log', this.players[this.state.currentPlayer].username + ' passed!'))
                this.state.currentPlayer = (this.state.currentPlayer + 1) % 4
            
            }
        }

        return this.state.scores
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
