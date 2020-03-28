<template>
    <div id="graph-modal" class="ui large modal">
        <div class="header">
            Score
        </div>
        <div class="content">
            <canvas ref="canvas"></canvas>
        </div>
    </div>
</template>

<script>
    import Chart from 'chart.js'

    export default {
        props: ['players', 'history'],

        methods: {
            init () {
                let colors = [
                    'rgb(208, 25, 25)',
                    'rgb(234, 174, 0)',
                    'rgb(22, 171, 57)',
                    'rgb(22, 120, 194)'
                ]

                let datasets = _.map(this.players, (player, playerIndex) => ({
                    label: player,
                    data: this.history[playerIndex],
                    borderColor: colors[playerIndex],
                    pointRadius: 2,
                    borderWidth: 2,
                    fill: false
                }))

                new Chart(this.$refs.canvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: _.range(29),
                        datasets: datasets
                    },
                    options: {
                        legend: {
                            position: 'bottom'
                        },
                    }
                })

                $('#graph-modal').modal('show')
            },
        }
    }
</script>

<style>
    
</style>