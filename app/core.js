var _ = require('lodash')

class Card {
    constructor (suit, value) {
        this.suit = suit
        this.value = value
    }

    toString () {
        return Card.symbols[_.indexOf(Card.suits, this.suit)] + Card.labels[this.value]
    }

    static suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
    static values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    static symbols = ['♥', '♦', '♣', '♠']
    static labels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

    static fromNumber (n) {
        return n > 51
            ? null
            : new Card(
                Card.suits[Math.trunc(n/13)],
                n % 13
            )
    }
}

class Deck {
    constructor () {
        this.cards = _.shuffle(_.range(52))
    }

    draw (n) {
        return n
            ? _.times(n, () => this.cards.pop())
            : this.cards.pop()
    }
}

class Player {
    constructor (username, socket = {}) {
        this.username = username
        this.socket = socket
        this.score = 0
        this.hand = []
        this.playableCards = [] // TODO
        this.playedGames = _.times(7, () => false)
    }
}

function isNewWinner (newCard, winningCard, trumpSuit) {
    if (!winningCard) {
        return true
    }

    if (newCard.suit == winningCard.suit) {
        return newCard.value > winningCard.value
    } else if (newCard.suit == trumpSuit) {
        return true
    }

    return false
}

function getTrickWinner (firstPlayer, trickCards, trumpSuit) {
    var trick = _.map([...trickCards], Card.fromNumber)

    winningCard = trick[0]
    winningCardIndex = 0

    trick.slice(1).forEach((card, index) => {
        if (isNewWinner(card, winningCard, trumpSuit)) {
            winningCard = card
            winningCardIndex = index + 1
        }
    })

    return (winningCardIndex + firstPlayer) % 4
}

global.Card = Card
global.Deck = Deck
global.Player = Player
global.isNewWinner = isNewWinner
global.getTrickWinner = getTrickWinner