<template>
    <div id="cards" class="ui middle aligned center aligned grid" :class="domino ? 'domino' : ''">
        <div class="column">
            <img v-for="card in hand"
                 class="card"
                 :src="'/img/' + card + '.png'"
                 @click="$emit('play', card)">
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            hand: {},
            domino: {
                type: Boolean
            }
        }
    }
</script>

<style>
    #cards {
        background-color: #ce6868;
        overflow: hidden;
    }

    #cards .card {
        margin-left: -2em;
    }

    #cards:not(.domino) .card:hover {
        -webkit-transform: scale(1.1);
        -ms-transform: scale(1.1);
        transform: scale(1.1);
    }

    #cards .playable.card:hover {
        -webkit-transform: scale(1.1);
        -ms-transform: scale(1.1);
        transform: scale(1.1);
    }

    #cards .playable.card {
        margin-bottom: 1.5em;
    }

    #cards.domino {
        background-color: #e79292;
    }
</style>