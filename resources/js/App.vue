<template>
    <div id="app" class="ui grid">
        <div class="twelve wide column">
            <div class="table row">
                <Table :game="games[game]"
                       :players="players"
                       :scores="scores"
                       :trickCards="trickCards"
                       :firstPlayer="firstPlayer"
                       :trumpSuit="trumpSuit"></Table>
            </div>
            <div class="cards row">
                <Cards :hand="hand"
                       :myTurn="currentPlayer == me"
                       @play="play">
                </Cards>
            </div>
        </div>
        <div class="four wide column">
            <Sidebar :logs="logs"></Sidebar>
        </div>
        <GameChooser ref="game-chooser"
                     :games="games"
                     :playedGames="playedGames"></GameChooser>
        <TrumpSuitChooser ref="trump-suit-chooser"
                          :suits="suits"></TrumpSuitChooser>
        <!--
        <StartingValueChooser ref="starting-value-chooser"></StartingValueChooser>
        -->
        <DoublingChooser ref="doubling-chooser"
                         :players="players"
                         :matrix="matrix"
                         :me="me"
                         :dealer="dealer"></DoublingChooser>
    </div>
</template>

<script>
    import Table from './components/Table.vue'
    import Cards from './components/Cards.vue'
    import Sidebar from './components/Sidebar.vue'
    import GameChooser from './components/GameChooser.vue'
    import TrumpSuitChooser from './components/TrumpSuitChooser.vue'
    //import StartingValueChooser from './components/StartingValueChooser.vue'
    import DoublingChooser from './components/DoublingChooser.vue'
    
    export default {
        name: 'App',
        
        components: {
            Table,
            Cards,
            Sidebar,
            GameChooser,
            TrumpSuitChooser,
            //StartingValueChooser,
            DoublingChooser,
        },

        created () {
            this.suits = [
                'Hearts',
                'Diamonds',
                'Clubs',
                'Spades'
            ]

            this.games = [
                'Atout',
                'Non prendere',
                'No cuori',
                'No re cuori',
                'No donne',
                'No ultime 2',
                'Domino'
            ]
        },

        data () {
            return {
                players: ['a', 'b', 'c', 'd'],
                scores: _.times(4, () => 0),

                matrix: _.times(4, () => _.times(4, () => 0)),
                dealer: 0,
                game: 0,
                currentPlayer: 0,
                firstPlayer: 0,
                trickCards: [],
                trumpSuit: '',              // for Atout
                startingValue: 0,           // for Domino

                me: 0,
                hand: [],
                playedGames: _.times(7, () => false),

                callback: () => null,
                
                logs: []
            }
        },

        computed: {

        },

        sockets: {
            /*
            connect () {
                console.log('connected to server')
            },
            
            disconnect () {
                console.log('disconnected from server')
            },
            */

            connected (username) {
                this.log(username + ' connected.')
            },

            disconnected (username) {
                this.log(username + ' disconnected.')
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

            scores (scores) {
                this.scores = scores
            },

            end (scores) {
                this.log('Game finished! Scores:', scores)
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
            
            log (message) {
                //this.logs.push('[' + (new Date()).toTimeString().substr(0,5) + '] ' + message)
                this.logs.push(message)
                setTimeout(() => {
                    var div = document.getElementById('sidebar')
                    div.scrollTop = div.scrollHeight
                }, 1)
            },
        }
    }
</script>

<style>
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
