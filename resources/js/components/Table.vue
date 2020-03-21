<template>
    <div id="table" class="ui middle aligned grid">
        <div class="one wide left info column">
            <div class="game">
                {{ games[game] + ' ' + _.get(suitSymbols, trumpSuit, '') }}
            </div>
            <div class="scores">
                <div v-for="element in _.zip(players, scores)" v-if="element[0]">
                    {{ element[0] }}: {{ element[1] }}
                </div>
            </div>
        </div>
        <template v-if="game == 6">
            <div class="fourteen wide center aligned domino column">
                <Cards domino :hand="hearts"></Cards>
                <Cards domino :hand="diamonds"></Cards>
                <Cards domino :hand="clubs"></Cards>
                <Cards domino :hand="spades"></Cards>
            </div>
        </template>
        <template v-else>
            <div class="five wide right aligned column">
            <div class="left player">
                <div>
                    <img class="card" :src="'/img/' + cards[3] + '.png'">
                </div>
                <label>{{ players[3] }}</label>
            </div>
        </div>
        <div class="four wide center aligned column">
            <div class="top player">
                <label>{{ players[2] }}</label>
                <div>
                    <img class="card" :src="'/img/' + cards[2] + '.png'">
                </div>
            </div>
            <div class="fill"></div>
            <div class="bottom player">
                <div>
                    <img class="card" :src="'/img/' + cards[0] + '.png'">
                </div>
                <label>{{ players[0] }}</label>
            </div>
        </div>
        <div class="five wide left aligned column">
            <div class="right player">
                <div>
                    <img class="card" :src="'/img/' + cards[1] + '.png'">
                </div>
                <label>{{ players[1] }}</label>
            </div>
        </div>
        </template>
        <div class="one wide right info column">
            
        </div>
    </div>
</template>

<script>
    import Cards from './Cards.vue'

    export default {
        components: {
            Cards
        },

        props: ['game', 'games', 'players', 'scores', 'trickCards', 'firstPlayer', 'trumpSuit', 'domino'],

        created () {
            this.suitSymbols = {
                'Hearts': '♥',
                'Diamonds': '♦',
                'Clubs': '♣',
                'Spades': '♠',
            }
        },

        computed: {
            cards () {
                let cards = _.assign(_.fill(new Array(4), 'empty'), [...this.trickCards])
                _.times(this.firstPlayer, () => cards.unshift(cards.pop()))
                return cards
            },

            hearts () {
                return (this.domino['Hearts'].ace ? [12] : []).concat(this.domino['Hearts'].cards)
            },

            diamonds () {
                return (this.domino['Diamonds'].ace ? [25] : []).concat(this.domino['Diamonds'].cards)
            },

            clubs () {
                return (this.domino['Clubs'].ace ? [38] : []).concat(this.domino['Clubs'].cards)
            },

            spades () {
                return (this.domino['Spades'].ace ? [51] : []).concat(this.domino['Spades'].cards)
            },
        },
    }
</script>

<style>
    #table .center.column, #table .domino.column {
        height: 100%;
        display: flex;
        flex-flow: column;
    }

    #table .left.info.column {
        height: 100%;
        padding-left: 1em !important;
        white-space: nowrap;
    }

    #table .left.info.column > * {
        padding-top: 0.5em;
    }

    #table .left.info.column > .game {
        font-weight: bold;
    }

    #table .left.info.column > .scores {
        position: absolute;
        z-index: 1;
    }

    #table .right.info.column {
        height: 100%;
    }

    #table .bottom.player, #table .top.player {
        flex: 0 1 auto;
    }

    #table .fill {
        flex: 1 1 auto;
    }

    #table .player {
        display: inline-block;
        text-align: center;
    }

    #table .player label {
        font-weight: bolder;
        font-size: large;
    }
</style>