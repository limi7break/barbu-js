<template>
    <div id="doubling-chooser" class="ui mini modal">
        <div class="header">
            Choose {{ redoubling ? 're' : '' }}doubling
        </div>
        <div class="content">
            <div class="ui form">
                <div v-for="player, index in players" class="field"
                     :class="{ disabled: cannotDouble(me, index) }">
                    <div class="ui checkbox">
                        <input v-if="redoubling ? redoubledBy(me, index) : (doubledBy(me, index) || (index == dealer && forceDealer))"
                               type="checkbox"
                               :checked="true"
                               :disabled="true">
                        <input v-else
                               v-model="matrix[me][index]"
                               type="checkbox"
                               :true-value="redoubling ? 2 : 1"
                               :false-value="0">
                        <label>
                            {{ player }}
                            <span v-if="redoubling && redoubledBy(me, index)">redoubled you!</span>
                            <span v-if="!redoubling && doubledBy(me, index)">doubled you!</span>
                            <span v-if="!redoubling && index == dealer && forceDealer">(forced)</span>
                        </label>
                    </div>
                </div>
                <button class="ui button" @click="select">OK</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['contract', 'players', 'matrix', 'me', 'dealer', 'forceDealer'],

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
                if (this.forceDealer) {
                    this.matrix[this.me][this.dealer] = 1
                }
                $('#doubling-chooser').modal({
                    closable: false,
                    dimmerSettings: { opacity: 0 }
                }).modal('show')
            },

            select () {
                this.callback(this.matrix[this.me])
                $('#doubling-chooser').modal('hide')
            },

            cannotDouble (me, other) {
                if (!this.redoubling) {
                    return (me == other)
                        || (me == this.dealer)
                        || (this.contract == 6 && other != this.dealer)
                } else {
                    return !this.doubledBy(me, other)
                }
            },

            doubledBy (me, other) {
                return this.matrix[other][me]
            },

            redoubledBy (me, other) {
                return this.matrix[other][me] > 1
            }
        }
    }
</script>