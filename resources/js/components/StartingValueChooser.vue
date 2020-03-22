<template>
    <div id="starting-value-chooser" class="ui mini modal">
        <div class="header">
            Choose starting value
        </div>
        <div class="content">
            <div class="ui link list">
                <a v-for="label, index in labels"
                   class="item"
                   @click="select(index)">
                    {{ label }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import { labels } from '@/constants'

    export default {
        created () {
            this.labels = labels
        },

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