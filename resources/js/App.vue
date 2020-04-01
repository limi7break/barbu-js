<template>
    <div id="app" class="ui grid">
        <div class="sixteen wide tablet twelve wide computer column">
            <div class="table row">
                <Table :game="game"
                       :players="players"
                       :scores="scores"
                       :matrix="matrix"
                       :trickCards="trickCards"
                       :firstPlayer="firstPlayer"
                       :trumpSuit="trumpSuit"
                       :startingValue="startingValue"
                       :domino="domino"
                       @score="score"
                       @info="info"
                       />
            </div>
            <div class="cards row">
                <Cards :hand="hand"
                       @play="play"
                       />
            </div>
        </div>
        <div class="four wide computer only column">
            <Sidebar ref="sidebar" :logs="logs" />
        </div>
        
        <GameChooser ref="game-chooser"
                     :playedGames="playedGames"
                     />
        <TrumpSuitChooser ref="trump-suit-chooser" />
        <StartingValueChooser ref="starting-value-chooser" />
        <DoublingChooser ref="doubling-chooser"
                         :game="game"
                         :players="players"
                         :matrix="matrix"
                         :me="me"
                         :dealer="dealer"
                         :forceDealer="me != dealer
                                    && _.sum(playedGames) > 5
                                    && dealerDoubled[me] < 2"
                         />
        <ScoresModal ref="scores-modal"
                     :players="players"
                     :history="history"
                     />
        <InfoModal ref="info-modal"
                   :playedGames="playedGames"
                   :players="players"
                   :dealer="dealer"
                   :dealerDoubled="dealerDoubled"
                   />
    </div>
</template>

<script>
    import { games } from '@/constants'
    import Table from '@/components/Table.vue'
    import Cards from '@/components/Cards.vue'
    import Sidebar from '@/components/Sidebar.vue'
    import GameChooser from '@/components/GameChooser.vue'
    import TrumpSuitChooser from '@/components/TrumpSuitChooser.vue'
    import StartingValueChooser from '@/components/StartingValueChooser.vue'
    import DoublingChooser from '@/components/DoublingChooser.vue'
    import ScoresModal from '@/components/ScoresModal.vue'
    import InfoModal from '@/components/InfoModal.vue'
    
    export default {
        name: 'App',
        
        components: {
            Table,
            Cards,
            Sidebar,
            GameChooser,
            TrumpSuitChooser,
            StartingValueChooser,
            DoublingChooser,
            ScoresModal,
            InfoModal,
        },

        created () {
            this.games = games
        },

        data () {
            return {
                players: [],
                scores: _.times(4, () => 0),
                history: _.times(4, () => [0]),

                matrix: _.times(4, () => _.times(4, () => 0)),
                dealerDoubled: _.times(4, () => 0),
                dealer: 0,
                game: null,
                firstPlayer: 0,
                currentPlayer: 0,
                trickCards: [],
                trumpSuit: null,            // for Atout
                startingValue: null,        // for Domino
                domino: {
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
                },

                me: 0,
                hand: [],
                playedGames: _.times(7, () => false),

                callback: () => null,
                
                logs: []
            }
        },

        sockets: {
            connected (username) {
                this.log(username + ' connected.')
            },

            disconnected (username) {
                this.log(username + ' disconnected.')
            },

            state (state) {

            },

            me (playerIndex) {
                this.me = playerIndex
            },

            players (players) {
                this.players = players
            },

            hand (hand) {
                this.hand = hand
            },

            playedGames (playedGames) {
                this.playedGames = playedGames
            },

            chooseGame (callback) {
                this.$refs['game-chooser'].init(callback)
            },

            dealer (dealer) {
                this.dealer = dealer
            },

            game (game) {
                this.game = game
            },

            chooseTrumpSuit (callback) {
                this.$refs['trump-suit-chooser'].init(callback)
            },

            trumpSuit (trumpSuit) {
                this.trumpSuit = trumpSuit
            },

            chooseStartingValue (callback) {
                this.$refs['starting-value-chooser'].init(callback)
            },

            startingValue (startingValue) {
                this.startingValue = startingValue
            },

            chooseDoubling (callback) {
                this.$refs['doubling-chooser'].init(callback)
            },

            matrix (matrix) {
                this.matrix = matrix
            },

            dealerDoubled (dealerDoubled) {
                this.dealerDoubled = dealerDoubled
            },

            chooseRedoubling (callback) {
                this.$refs['doubling-chooser'].init(callback, true)
            },

            currentPlayer (playerIndex) {
                this.currentPlayer = playerIndex
            },

            firstPlayer (playerIndex) {
                this.firstPlayer = playerIndex
            },

            turn (callback) {
                this.callback = callback
            },

            trickCards (trickCards) {
                this.trickCards = trickCards
            },

            domino (domino) {
                this.domino = domino
            },

            gameScores (scores) {
                this.log('<b>' + this.games[this.game] + ' finished! Scores:</b>')
                _.each(scores, (score, playerIndex) => {
                    this.history[playerIndex].push(this.history[playerIndex].slice(-1)[0] + score)
                    this.log('<b>' + this.players[playerIndex] + ': ' + score + '</b>')
                })
            },

            resetTable () {
                this.trickCards = []
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
            },

            totalScores (scores) {
                this.scores = scores
            },

            end () {
                let winnerIndex = _.indexOf(this.scores, _.max(this.scores))
                this.log('<b>Game finished! ' + this.players[winnerIndex] + ' wins!</b>')
            },

            log (message) {
                this.log(message)
            },
        },
        
        methods: {
            play (card) {
                this.callback(card)
                this.callback = () => null
            },

            score () {
                this.$refs['scores-modal'].init()
            },

            info () {
                this.$refs['info-modal'].init()
            },
            
            log (message) {
                //this.logs.push('[' + (new Date()).toTimeString().substr(0,5) + '] ' + message)
                this.logs.push(message)
                this.$nextTick(() => {
                    let sidebar = this.$refs.sidebar.$el
                    sidebar.scrollTop = sidebar.scrollHeight
                })
            },
        }
    }
</script>

<style>
    html {
        background-color: #ce6868;
    }

    #app {
        background-color: #e79292;
    }

    .ui.grid, .ui.grid .column, .ui.grid .row {
        margin: 0 !important;
        padding: 0 !important;
    }

    .ui.grid {
        height: 100%;
    }

    .table.row {
        height: 70%;
        padding: 1em 0 !important;
    }

    .cards.row {
        height: 30%;
    }
</style>
