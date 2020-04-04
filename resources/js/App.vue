<template>
    <div id="app" class="ui grid">
        <template v-if="room">
            <div class="sixteen wide tablet twelve wide computer column">
                <div class="table row">
                    <Table :contract="contract"
                           :players="players"
                           :scores="scores"
                           :matrix="matrix"
                           :firstPlayer="firstPlayer"
                           :currentPlayer="currentPlayer"
                           :trickCards="trickCards"
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
            
            <ContractChooser ref="contract-chooser"
                             :playedContracts="playedContracts"
                             />
            <TrumpSuitChooser ref="trump-suit-chooser" />
            <StartingValueChooser ref="starting-value-chooser" />
            <DoublingChooser ref="doubling-chooser"
                             :contract="contract"
                             :players="players"
                             :matrix="matrix"
                             :me="me"
                             :dealer="dealer"
                             :forceDealer="me != dealer
                                        && _.sum(playedContracts) > 6
                                        && dealerDoubled[me] < 2"
                             />
            <ScoresModal ref="scores-modal"
                         :players="players"
                         :history="history"
                         />
            <InfoModal ref="info-modal"
                       :players="players"
                       :dealer="dealer"
                       :dealerDoubled="dealerDoubled"
                       :playedContracts="playedContracts"
                       />
        </template>
        <template v-else>
            <div class="rooms row">
                <div class="rooms column">
                    <h2 class="ui dividing header">Rooms</h2>
                    <div v-if="!_.isEmpty(rooms)" class="ui divided list">
                        <a v-for="numPlayers, name in rooms" class="item" @click="$socket.client.emit('join', name)">
                            <i class="door open icon"></i>
                            <div class="content">
                                <div class="header">{{ name }}</div>
                                <div class="description">
                                    {{ numPlayers }} players
                                </div>
                            </div>
                        </a>
                    </div>
                    <div v-else class="ui placeholder segment">
                        <div class="ui icon header">
                            <i class="door closed icon"></i>
                            No rooms available.
                        </div>
                    </div>
                    <div class="ui hidden divider"></div>
                    <form class="ui form" @submit.prevent="$socket.client.emit('join', $refs.room.value)">
                        <div class="field">
                            <div class="ui left icon input">
                                <i class="user icon"></i>
                                <input ref="room" type="text" placeholder="Room name" autofocus>
                            </div>
                        </div>
                        <button class="ui fluid large red submit button">
                            Create!
                        </button>
                    </form>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    import { contracts } from '@/constants'
    import Table from '@/components/Table.vue'
    import Cards from '@/components/Cards.vue'
    import Sidebar from '@/components/Sidebar.vue'
    import ContractChooser from '@/components/ContractChooser.vue'
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
            ContractChooser,
            TrumpSuitChooser,
            StartingValueChooser,
            DoublingChooser,
            ScoresModal,
            InfoModal,
        },

        created () {
            this.contracts = contracts
        },

        data () {
            return {
                rooms: {},
                room: null,

                /*
                 * Data related to the whole game
                 */
                players: [],
                scores: _.times(4, () => 0),
                history: _.times(4, () => [0]),
                me: null,

                /*
                 * Data related to the current dealer
                 */
                dealer: null,
                dealerDoubled: _.times(4, () => 0),
                playedContracts: _.times(7, () => false),
                
                /*
                 * Data related to the current contract
                 */
                contract: null,
                matrix: _.times(4, () => _.times(4, () => 0)),
                firstPlayer: null,
                currentPlayer: null,
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

                /*
                 * Data related to the player
                 */
                hand: [],
                callback: () => null,
                
                /*
                 * Other data
                 */
                logs: []
            }
        },

        sockets: {
            connected (username) {
                this.log(username + ' connected.')
            },

            reconnected (username) {
                this.log(username + ' reconnected.')
            },

            disconnected (username) {
                this.log(username + ' disconnected.')
            },

            rooms (rooms) {
                this.rooms = rooms
            },

            room (room) {
                this.room = room
            },

            init (data) {
                this.room = data.room
                
                this.players = data.players
                this.scores = data.scores
                this.history = data.history
                this.me = data.me

                this.dealer = data.dealer
                this.dealerDoubled = data.dealerDoubled

                this.contract = data.contract
                this.matrix = data.matrix
                this.firstPlayer = data.firstPlayer
                this.currentPlayer = data.currentPlayer
                this.trickCards = data.trickCards

                this.trumpSuit = data.trumpSuit

                this.startingValue = data.startingValue
                this.domino = data.domino

                this.hand = data.hand
                this.playedContracts = data.playedContracts
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

            playedContracts (playedContracts) {
                this.playedContracts = playedContracts
            },

            chooseContract (callback) {
                this.$nextTick(() => this.$refs['contract-chooser'].init(callback))
            },

            dealer (dealer) {
                this.dealer = dealer
            },

            contract (contract) {
                this.contract = contract
            },

            chooseTrumpSuit (callback) {
                this.$nextTick(() => this.$refs['trump-suit-chooser'].init(callback))
            },

            trumpSuit (trumpSuit) {
                this.trumpSuit = trumpSuit
            },

            chooseStartingValue (callback) {
                this.$nextTick(() => this.$refs['starting-value-chooser'].init(callback))
            },

            startingValue (startingValue) {
                this.startingValue = startingValue
            },

            chooseDoubling (callback) {
                this.$nextTick(() => this.$refs['doubling-chooser'].init(callback))
            },

            matrix (matrix) {
                this.matrix = matrix
            },

            dealerDoubled (dealerDoubled) {
                this.dealerDoubled = dealerDoubled
            },

            chooseRedoubling (callback) {
                this.$nextTick(() => this.$refs['doubling-chooser'].init(callback, true))
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

            contractScores (scores) {
                this.log('<b>' + this.contracts[this.contract] + ' finished! Scores:</b>')
                _.each(scores, (score, playerIndex) => {
                    this.log('<b>' + this.players[playerIndex] + ': ' + score + '</b>')
                })
            },

            history (history) {
                this.history = history
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

    input {
        background-color: #ffd7d7;
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

    .rooms.row {
        justify-content: center !important;
        align-content: center;
    }

    .rooms.column {
        max-width: 450px;
    }

    .rooms.column > .placeholder.segment {
        background-color: lightgray;
    }
</style>
