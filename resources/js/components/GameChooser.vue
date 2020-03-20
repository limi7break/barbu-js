<template>
    <div id="game-chooser" class="ui mini modal">
        <div class="header">
            Choose game
        </div>
        <div class="content">
            <div class="ui link list">
                <a v-for="game, index in games"
                   class="item"
                   :class="{ disabled: playedGames[index] }"
                   @click="select(index)">
                    {{ game }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['games', 'playedGames'],

        data () {
            return {
                callback: () => null
            }
        },

        methods: {
            init (callback) {
                this.callback = callback
                $('#game-chooser').modal({
                    closable: false,
                    dimmerSettings: { opacity: 0 }
                }).modal('show')
            },

            select (value) {
                this.callback(value)
                $('#game-chooser').modal('hide')
            }
        }
    }
</script>

<style>
    #game-chooser .disabled.item {
        text-decoration: line-through;
    }
</style>