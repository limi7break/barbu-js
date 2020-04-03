<template>
    <div id="contract-chooser" class="ui mini modal">
        <div class="header">
            Choose contract
        </div>
        <div class="content">
            <div class="ui link list">
                <a v-for="contract, index in contracts"
                   class="item"
                   :class="{ disabled: playedContracts[index] }"
                   @click="select(index)">
                    {{ contract }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import { contracts } from '@/constants'

    export default {
        props: ['playedContracts'],

        created () {
            this.contracts = contracts
        },

        data () {
            return {
                callback: () => null
            }
        },

        methods: {
            init (callback) {
                this.callback = callback
                $('#contract-chooser').modal({
                    closable: false,
                    dimmerSettings: { opacity: 0 }
                }).modal('show')
            },

            select (value) {
                this.callback(value)
                $('#contract-chooser').modal('hide')
            }
        }
    }
</script>

<style>
    #contract-chooser .disabled.item {
        text-decoration: line-through;
    }
</style>