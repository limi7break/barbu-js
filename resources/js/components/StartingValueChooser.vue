<template>
    <div id="starting-value-chooser" class="ui mini modal">
        <div class="header">
            Choose starting value
        </div>
        <div class="content">
            <div class="ui link list">
                <a v-for="value in 13"
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
                $('#starting-value-chooser').modal({
                    closable: false,
                    dimmerSettings: { opacity: 0 }
                }).modal('show')
            },

            select (value) {
                this.callback(value)
                $('#starting-value-chooser').modal('hide')
            }
        }
    }
</script>