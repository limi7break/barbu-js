<template>
    <div id="table" class="ui middle aligned grid">
        <div class="info">
            <div class="game">
                {{ _.get(games, game, '') }}
                <span v-if="game == 0"> {{ _.get(symbols, _.indexOf(suits, trumpSuit), '') }}</span>
                <span v-if="game == 6"> {{ _.get(labels, startingValue, '') }}</span>
            </div>
            <div class="divider"></div>
            <div class="score" v-for="element in _.zip(players, scores)" v-if="element[0]">
                {{ element[0] }}: {{ element[1] }}
            </div>
            <div class="divider"></div>
            <button class="ui tiny basic icon button" @click="$emit('graph')">
                <i class="chart line icon"></i>
                Graph
            </button>
        </div>
        <template v-if="game == 6">
            <div class="sixteen wide center aligned domino column">
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
        <div class="six wide center aligned column">
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
    </div>
</template>

<script>
    import { games, suits, symbols, labels } from '@/constants'
    import Cards from '@/components/Cards.vue'

    export default {
        components: {
            Cards
        },

        props: ['game', 'players', 'scores', 'trickCards', 'firstPlayer', 'trumpSuit', 'startingValue', 'domino'],

        created () {
            this.games = games
            this.suits = suits
            this.symbols = symbols
            this.labels = labels
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

    #table .info {
        position: fixed;
        padding: 1em 0 0 1em !important;
        z-index: 101;
    }

    #table .info > .game {
        font-weight: bold;
    }

    #table .info > .divider {
        margin: 1em 0;
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