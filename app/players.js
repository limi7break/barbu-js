var _ = require('lodash')

class Player {
    constructor (username, socket = {}) {
        this.username = username
        this.score = 0
        this.hand = []
        this.playedContracts = _.times(7, () => false)
        this.playableCards = [] // TODO
        this.socket = socket
    }
}

class HumanPlayer extends Player {
    constructor (username, socket = {}) {
        super(username, socket)
    }
}

class RandomPlayer extends Player {
    constructor (username, socket = {}) {
        super(username, socket)
    }
}



global.HumanPlayer = HumanPlayer
global.RandomPlayer = RandomPlayer
