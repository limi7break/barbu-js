<template>
    <div id="table" class="ui middle aligned grid">
        <div class="info">
            <div class="current contract">
                {{ _.get(contracts, contract, '') }}
                <span v-if="contract == 0"> {{ _.get(symbols, _.indexOf(suits, trumpSuit), '') }}</span>
                <span v-if="contract == 6"> {{ _.get(labels, startingValue, '') }}</span>
            </div>
            <div class="divider"></div>
            <div class="scores">
                <template v-for="element in _.zip(players, scores)" v-if="element[0]">
                    <div>
                        {{ element[0] }}
                    </div>
                    <div class="score">
                        {{ element[1] }}
                    </div>
                </template>
            </div>
            <div class="divider"></div>
            <div class="ui vertical compact labeled icon basic fluid buttons">
                <button class="ui button" @click="$emit('score')">
                    <i class="chart line icon"></i>
                    Scores
                </button>
                <button class="ui button" @click="arrows = !arrows" :class="{ active: arrows }">
                    <i class="icon" :class="[arrows ? 'eye slash' : 'eye']"></i>
                    Doubling
                </button>
                <button class="ui button" @click="$emit('info')">
                    <i class="info circle icon"></i>
                    Info
                </button>
            </div>
        </div>
        <template v-if="contract == 6">
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
                    <div class="card container">
                        <img class="card" :src="'/img/' + cards[3] + '.png'" :class="{ transparent: arrows }">
                    </div>
                    <div class="label">
                        <label>{{ players[3] }}</label>
                        <div class="glue"></div>
                    </div>
                </div>
            </div>
            <div class="six wide center aligned column">
                <div class="top player">
                    <div class="label">
                        <label>{{ players[2] }}</label>
                        <div class="glue"></div>
                    </div>
                    <div class="card container">
                        <img class="card" :src="'/img/' + cards[2] + '.png'" :class="{ transparent: arrows }">
                    </div>
                </div>
                <div class="fill"></div>
                <div class="bottom player">
                    <div class="card container">
                        <img class="card" :src="'/img/' + cards[0] + '.png'" :class="{ transparent: arrows }">
                    </div>
                    <div class="label">
                        <div class="glue"></div>
                        <label>{{ players[0] }}</label>
                    </div>
                </div>
            </div>
            <div class="five wide left aligned column">
                <div class="right player">
                    <div class="card container">
                        <img class="card" :src="'/img/' + cards[1] + '.png'" :class="{ transparent: arrows }">
                    </div>
                    <div class="label">
                        <div class="glue"></div>
                        <label>{{ players[1] }}</label>
                    </div>
                </div>
            </div>
        </template>
        <!-- 0 -> 1 -->
        <Connection v-if="arrows && (matrix[0][1] || matrix[1][0])" :key="'one-' + width + '-' + height"
                    from=".bottom.player .glue" to=".right.player .glue"
                    fromX="0.55"
                    toY="1"
                    :head="!!matrix[1][0]"
                    :tail="!!matrix[0][1]"
                    :color="Math.max(matrix[1][0], matrix[0][1]) == 2 ? 'red' : 'black'"></Connection>
        <!-- 1 -> 2 -->
        <Connection v-if="arrows && (matrix[1][2] || matrix[2][1])" :key="'two-' + width + '-' + height"
                    from=".right.player .glue" to=".top.player .glue"
                    fromY="0"
                    toX="0.55"
                    :head="!!matrix[2][1]"
                    :tail="!!matrix[1][2]"
                    :color="Math.max(matrix[2][1], matrix[1][2]) == 2 ? 'red' : 'black'"></Connection>
        <!-- 2 -> 3 -->
        <Connection v-if="arrows && (matrix[2][3] || matrix[3][2])" :key="'three-' + width + '-' + height"
                    from=".top.player .glue" to=".left.player .glue"
                    fromX="0.45"
                    toY="0"
                    :head="!!matrix[3][2]"
                    :tail="!!matrix[2][3]"
                    :color="Math.max(matrix[3][2], matrix[2][3]) == 2 ? 'red' : 'black'"></Connection>
        <!-- 3 -> 0 -->
        <Connection v-if="arrows && (matrix[3][0] || matrix[0][3])" :key="'four-' + width + '-' + height"
                    from=".left.player .glue" to=".bottom.player .glue"
                    fromY="1"
                    toX="0.45"
                    :head="!!matrix[0][3]"
                    :tail="!!matrix[3][0]"
                    :color="Math.max(matrix[0][3], matrix[3][0]) == 2 ? 'red' : 'black'"></Connection>
        <!-- 3 -> 1 -->
        <Connection v-if="arrows && (matrix[3][1] || matrix[1][3])" :key="'five-' + width + '-' + height"
                    from=".left.player .glue" to=".right.player .glue"
                    :head="!!matrix[1][3]"
                    :tail="!!matrix[3][1]"
                    :color="Math.max(matrix[1][3], matrix[3][1]) == 2 ? 'red' : 'black'"></Connection>
        <!-- 2 -> 0 -->
        <Connection v-if="arrows && (matrix[2][0] || matrix[0][2])" :key="'six-' + width + '-' + height"
                    from=".top.player .glue" to=".bottom.player .glue"
                    :head="!!matrix[0][2]"
                    :tail="!!matrix[2][0]"
                    :color="Math.max(matrix[0][2], matrix[2][0]) == 2 ? 'red' : 'black'"></Connection>
    </div>
</template>

<script>
    import { contracts, suits, symbols, labels } from '@/constants'
    import Cards from '@/components/Cards.vue'

    export default {
        components: {
            Cards,
        },

        props: ['contract', 'players', 'scores', 'matrix', 'trickCards', 'firstPlayer', 'trumpSuit', 'startingValue', 'domino'],

        created () {
            this.contracts = contracts
            this.suits = suits
            this.symbols = symbols
            this.labels = labels
            window.addEventListener('resize', this.resize)
        },

        destroyed () {
            window.removeEventListener('resize', this.resize)
        },

        data () {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                arrows: false,
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

        methods: {
            resize () {
                this.width  = document.documentElement.clientWidth
                this.height = document.documentElement.clientHeight
            },
        }
    }
</script>

<style>
    #table > .info {
        position: fixed;
        padding: 1em 0 0 1em !important;
        z-index: 101;
    }

    #table > .info > .current.contract {
        font-weight: bold;
    }

    #table > .info > .scores {
        display: grid;
        grid-template-columns: 1fr auto;
        column-gap: 1em;
    }

    #table > .info > .scores > .score {
        font-weight: bold;
    }

    #table > .info > .buttons {
        border: 1px solid rgba(34, 36, 38, .30);
    }

    #table > .info > .buttons .button:hover,
    #table > .info > .buttons .button:active {
        background: #ffd7d7;
        box-shadow: none;
        -webkit-box-shadow: none;
    }

    #table > .info > .buttons .button:focus {
        background: #e79292;
    }

    #table > .info > .buttons .button.active {
        background: rgba(0, 0, 0, .10);
    }

    #table > .info > .buttons .button.active:focus {
        background: rgba(0, 0, 0, .10);
    }

    #table > .info > .divider {
        margin: 1em 0;
    }

    #table > .center.column {
        height: 100%;
        display: flex;
        flex-flow: column;
    }

    #table > .center.column > .top.player, #table > .center.column > .bottom.player {
        flex: 0 1 auto;
    }

    #table > .center.column > .fill {
        flex: 1 1 auto;
    }

    #table .player {
        display: inline-block;
        text-align: center;
    }

    #table .player > .label > label {
        flex: 1;
        font-weight: bolder;
        font-size: large;
    }

    #table .left.player > .label, #table .right.player > .label {
        display: flex;
    }

    #table .left.player > .card.container {
        text-align: right;
    }

    #table .right.player > .card.container {
        text-align: left;
    }

    #table .transparent.card {
        opacity: .5;
    }
</style>