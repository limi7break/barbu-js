<template>
    <div id="doubling-chooser" class="ui mini modal">
        <div class="header">
            Choose {{ redoubling ? 're' : '' }}doubling
        </div>
        <div class="content">
            <div class="ui form">
                <div v-for="player, index in players" class="field"
                     :class="{ disabled: (me == dealer) || (index == me) || (redoubling ? (matrix[index][me] != 1) : matrix[index][me]) }">
                    <div class="ui checkbox">
                        <input v-model="matrix[me][index]"
                               type="checkbox"
                               :true-value="redoubling ? 2 : 1"
                               :false-value="0">
                        <label>{{ player }}</label>
                    </div>
                </div>
                <button class="ui button" @click="select">OK</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['players', 'matrix', 'me', 'dealer'],

        data () {
            return {
                redoubling: false,
                callback: () => null
            }
        },

        methods: {
            init (callback, redoubling = false) {
                this.redoubling = redoubling
                this.callback = callback
                $('#doubling-chooser').modal({
                    closable: false,
                    dimmerSettings: { opacity: 0 }
                }).modal('show')
            },

            select () {
                this.callback(this.matrix[this.me])
                $('#doubling-chooser').modal('hide')
            }
        }
    }
</script>