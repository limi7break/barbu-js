<template>
    <div id="trump-suit-chooser" class="ui mini modal">
        <div class="header">
            Choose trump suit
        </div>
        <div class="content">
            <div class="ui link list">
                <a v-for="suit in suits"
                   class="item"
                   @click="select(suit)">
                    {{ suit }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import { suits } from '@/constants'

    export default {
        created () {
            this.suits = suits
        },

        data () {
            return {
                callback: () => null
            }
        },

        methods: {
            init (callback) {
                this.callback = callback
                $('#trump-suit-chooser').modal({
                    closable: false,
                    dimmerSettings: { opacity: 0 }
                }).modal('show')
            },

            select (value) {
                this.callback(value)
                $('#trump-suit-chooser').modal('hide')
            }
        }
    }
</script>