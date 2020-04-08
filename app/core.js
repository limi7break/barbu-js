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
    static symbols = ['♥', '♦', '♣', '♠']

    static values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
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
    var trick = _.map(trickCards, Card.fromNumber)

    winningCard = _.first(trick)
    winningCardIndex = 0

    trick.slice(1).forEach((card, index) => {
        if (isNewWinner(card, winningCard, trumpSuit)) {
            winningCard = card
            winningCardIndex = index + 1
        }
    })

    return (winningCardIndex + firstPlayer) % 4
}

function broadcast (players, eventName, ...args) {
    _.map(players, player => player.socket.emit(eventName, ...args))
}

global.Card = Card
global.Deck = Deck
global.isNewWinner = isNewWinner
global.getTrickWinner = getTrickWinner
global.broadcast = broadcast
