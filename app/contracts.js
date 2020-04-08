var _ = require('lodash')
require('./core')

class Contract {
    constructor (dealer, contract) {
        this.dealer = dealer
        this.contract = contract
        this.matrix = _.times(4, () => _.times(4, () => 0))
        this.firstPlayer = 0
        this.currentPlayer = 0
        this.trickCards = []
        
        this.trumpSuit = null           // for Atout
        
        this.startingValue = null       // for Domino
        this.domino = {
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
        this.points = []
        
        this.hearts = null              // for No Hearts
        
        this.queens = null              // for No Queens

        this.players = []
        this.scores = _.times(4, () => 0)
        this.terminal = false
    }

    validate (card) {
        // Default behavior: enforce following suit if possible.
        
        if (!this.trickCards.length) {
            return true
        }

        var trick = _.map(this.trickCards, Card.fromNumber)
        var hand = _.map(this.players[this.currentPlayer].hand, Card.fromNumber)

        if(!_.filter(hand, card => card.suit == _.first(trick).suit).length) {
            return true
        }

        return Card.fromNumber(card).suit == _.first(trick).suit
    }

    async play (players) {
        this.players = players
        
        while (!this.terminal) {
            broadcast(this.players, 'currentPlayer', this.currentPlayer)

            // Ask current player for a card
            do {
                var playedCard = await new Promise((resolve, reject) => {
                    this.players[this.currentPlayer].socket.emit('turn', response => {
                        resolve(response)
                    })
                })
            } while (playedCard === undefined)

            // Validate played card
            if (this.validate(playedCard)) {
                
                // Remove played card from the player's hand
                _.remove(this.players[this.currentPlayer].hand, card => card == playedCard)
                
                // Put card in the trick cards
                this.trickCards.push(playedCard)
                
                // Update player's hand in the client
                this.players[this.currentPlayer].socket.emit('hand', this.players[this.currentPlayer].hand)

                broadcast(this.players, 'firstPlayer', this.firstPlayer)
                broadcast(this.players, 'trickCards', this.trickCards)
                
                // Trick ended?
                if (this.trickCards.length == 4) {
                    
                    // Calculate trick winner and update first/current player accordingly
                    this.firstPlayer = getTrickWinner(this.firstPlayer, this.trickCards, this.trumpSuit)
                    this.currentPlayer = this.firstPlayer
                    
                    // Update scores based on trick winner and trick cards (contract specific)
                    this.updateScores()
                    
                    broadcast(this.players, 'log', this.players[this.currentPlayer].username + ' won the trick!\n')
                    
                    this.trickCards = []
                
                } else {
                    this.currentPlayer = (this.currentPlayer + 1) % 4
                }

                // If everyone has an empty hand, the state is terminal
                if (!_.flatten(_.map(players, 'hand')).length) {
                    this.terminal = true
                }
            
            } else {
                this.players[this.currentPlayer].socket.emit('log', 'Card not valid.')
            }
        }

        return this.scores
    }
}

class Atout extends Contract {
    constructor (dealer) {
        super(dealer, 0)
    }

    updateScores () {
        this.scores[this.currentPlayer] += 5
    }
}

class NoTricks extends Contract {
    constructor (dealer) {
        super(dealer, 1)
    }

    updateScores () {
        this.scores[this.currentPlayer] -= 2
    }
}

class NoHearts extends Contract {
    constructor (dealer) {
        super(dealer, 2)
        this.hearts = 0
    }

    validate (card) {
        var trick = _.map(this.trickCards, Card.fromNumber)
        var hand = _.map(this.players[this.currentPlayer].hand, Card.fromNumber)

        if (!this.trickCards.length) {
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
        _.each(_.map(this.trickCards, Card.fromNumber), card => {
            if (card.suit == 'Hearts') {
                this.hearts += 1
                if (card.value > 7) {
                    this.scores[this.currentPlayer] -= 4
                } else {
                    this.scores[this.currentPlayer] -= 2
                }
            }
        })

        if (this.hearts == 13) {
            this.terminal = true
        }
    }
}

class NoKingOfHearts extends Contract {
    constructor (dealer) {
        super(dealer, 3)
    }

    validate (card) {
        var trick = _.map(this.trickCards, Card.fromNumber)
        var hand = _.map(this.players[this.currentPlayer].hand, Card.fromNumber)

        if (!this.trickCards.length) {
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
        _.each(this.trickCards, card => {
            if (card == 11) {
                this.scores[this.currentPlayer] -= 20
                this.terminal = true
            }
        })
    }
}

class NoQueens extends Contract {
    constructor (dealer) {
        super(dealer, 4)
        this.queens = 0
    }

    updateScores () {
        var queens = [10, 23, 36, 49]

        _.each(this.trickCards, card => {
            if (_.includes(queens, card)) {
                this.queens += 1
                this.scores[this.currentPlayer] -= 6
            }
        })

        if (this.queens == 4) {
            this.terminal = true
        }
    }
}

class NoLastTwo extends Contract {
    constructor (dealer) {
        super(dealer, 5)
    }

    updateScores () {
        if (_.flatten(_.map(this.players, 'hand')).length < 8) {
            this.scores[this.currentPlayer] -= 12
        }
    }
}

class Domino extends Contract {
    constructor (dealer) {
        super(dealer, 6)
        this.domino = {
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
        this.points = [45, 20, 10, -10]
    }

    validate (card) {
        var playedCard = Card.fromNumber(card)
        
        if (playedCard.value == this.startingValue) {
            return true
        }

        var suitCards = _.map(this.domino[playedCard.suit].cards, Card.fromNumber)

        if (playedCard.value == 12) {
            return _.get(_.first(suitCards), 'value') == 0
        }

        if (playedCard.value == 0 && this.domino[playedCard.suit].ace) {
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

        if (playedCard.value == 12) {
        
            this.domino[playedCard.suit].ace = true
        
        } else {
        
            this.domino[playedCard.suit].cards
                = _.chain(this.domino[playedCard.suit].cards)
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
        this.currentPlayer = (this.currentPlayer + 1) % 4

        while (!this.terminal) {
            broadcast(this.players, 'currentPlayer', this.currentPlayer)
            
            // Check if the current player can play a card
            // If they can't, automatically pass the turn
            if (this.canPlay(this.currentPlayer)) {

                // Ask current player for a card
                do {
                    var playedCard = await new Promise((resolve, reject) => {
                        this.players[this.currentPlayer].socket.emit('turn', response => {
                            resolve(response)
                        })
                    })
                } while (playedCard === undefined)

                // Validate played card
                if (this.validate(playedCard)) {
                    
                    // Remove played card from the player's hand
                    _.remove(this.players[this.currentPlayer].hand, card => card == playedCard)
                    
                    // Attach card to domino
                    this.attachCard(playedCard)
                    
                    // Update player's hand in the client
                    this.players[this.currentPlayer].socket.emit('hand', this.players[this.currentPlayer].hand)
                    
                    // If the player has an empty hand, give them the highest available score
                    if (!this.players[this.currentPlayer].hand.length) {
                        this.scores[this.currentPlayer] = this.points.shift()
                    }

                    this.currentPlayer = (this.currentPlayer + 1) % 4

                    broadcast(this.players, 'domino', this.domino)

                    // If everyone has an empty hand, the state is terminal
                    if (!_.flatten(_.map(players, 'hand')).length) {
                        this.terminal = true
                    }
                
                } else {
                    this.players[this.currentPlayer].socket.emit('log', 'Card not valid.')
                }

            } else {
                
                _.map(this.players, player => player.socket.emit('log', this.players[this.currentPlayer].username + ' passed!'))
                this.currentPlayer = (this.currentPlayer + 1) % 4
            
            }
        }

        return this.scores
    }
}



function createContract (contract) {
    const contracts = [
        Atout,
        NoTricks,
        NoHearts,
        NoKingOfHearts,
        NoQueens,
        NoLastTwo,
        Domino
    ]

    return new contracts[contract]
}



global.Contract = Contract
global.Atout = Atout
global.NoTricks  = NoTricks  
global.NoHearts = NoHearts
global.NoKingOfHearts = NoKingOfHearts
global.NoQueens = NoQueens
global.NoLastTwo = NoLastTwo
global.Domino = Domino
global.createContract = createContract
