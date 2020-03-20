<template>
    <div id="table" class="ui middle aligned grid">
        <div class="one wide left info column">
            <div style="padding-top: 0.5em; font-weight: bold;">
                {{ game + ' ' + _.get(suitSymbols, trumpSuit, '') }}
            </div>
            <div style="padding-top: 0.5em;">
                <div v-for="element in _.zip(players, scores)" v-if="element[0]">
                    {{ element[0] }}: {{ element[1] }}
                </div>
            </div>
        </div>
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
        <div class="one wide right info column">
            
        </div>
    </div>
</template>

<script>
    export default {
        props: ['game', 'players', 'scores', 'trickCards', 'firstPlayer', 'trumpSuit'],

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
            }
        }
    }
</script>

<style>
    #table .center.column {
        height: 100%;
        display: flex;
        flex-flow: column;
    }

    #table .left.info.column {
        height: 100%;
        padding-left: 1em !important;
        white-space: nowrap;
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