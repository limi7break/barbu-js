<template>
    <div id="info-modal" class="ui small modal">
        <div class="header">
            Info
        </div>
        <div class="content">
            <div class="ui grid">
                <div class="row">
                    <div class="six wide column">
                        <h4 class="ui header">Remaining contracts</h4>
                        <div v-for="element in _.zip(contracts, playedGames)" v-if="!element[1]">
                            {{ element[0] }}
                        </div>
                    </div>
                    <div class="ten wide column">
                        <h4 class="ui header">Dealer: {{ players[dealer] }}</h4>
                        <div v-for="element in _.zip(players, dealerDoubled)" v-if="element[0] != players[dealer]">
                            {{ element[0] }} doubled the dealer <span :style="{ color: element[1] < 2 ? 'red' : 'green' }">{{ element[1] }}</span> out of 2 times
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { contracts } from '@/constants'

    export default {
        props: ['playedGames', 'players', 'dealer', 'dealerDoubled'],

        created () {
            this.contracts = contracts
        },

        methods: {
            init () {
                $('#info-modal').modal('show')
            },
        }
    }
</script>
