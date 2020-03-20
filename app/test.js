// No trump. Put higher value of same suit -> True
console.log(isNewWinner(new Card('Hearts', 8),
            new Card('Hearts', 7)))

// No trump. Put lower value of same suit -> False
console.log(!isNewWinner(new Card('Clubs', 3),
            new Card('Clubs', 4)))

// No trump. Put other suit -> False
console.log(!isNewWinner(new Card('Hearts', 12),
            new Card('Spades', 0)))
console.log(!isNewWinner(new Card('Diamonds', 12),
            new Card('Spades', 0)))
console.log(!isNewWinner(new Card('Clubs', 12),
            new Card('Spades', 0)))

// Trump = Diamonds. Put higher trump -> True
console.log(isNewWinner(new Card('Diamonds', 8),
            new Card('Diamonds', 7), 'Diamonds'))

// Trump = Spades. Put lower trump -> False
console.log(!isNewWinner(new Card('Spades', 3),
            new Card('Spades', 4), 'Spades'))

// Trump = Hearts. Put trump over other suit -> True
console.log(isNewWinner(new Card('Hearts', 0),
            new Card('Diamonds', 12), 'Hearts'))
console.log(isNewWinner(new Card('Hearts', 0),
            new Card('Clubs', 12), 'Hearts'))
console.log(isNewWinner(new Card('Hearts', 0),
            new Card('Spades', 12), 'Hearts'))

// Normal trick, everyone follows suit. 3 wins
getTrickWinner(0, [new Card('Clubs', 2),
                   new Card('Clubs', 7),
                   new Card('Clubs', 10),
                   new Card('Clubs', 12)])

// Trump = Diamonds wins. 2 wins
getTrickWinner(0, [new Card('Spades', 10),
                   new Card('Spades', 11),
                   new Card('Diamonds', 0),
                   new Card('Spades', 12)],
                   'Diamonds')

// No one follows suit, no trump. 0 wins
getTrickWinner(0, [new Card('Hearts', 0),
                   new Card('Diamonds', 12),
                   new Card('Clubs', 12),
                   new Card('Spades', 12)])