<template>
    <div id="cards" class="ui middle aligned center aligned grid">
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
        props: ['hand', 'myTurn'],

        // :class="(myTurn && card.playable ? 'playable' : '') + ' card'"
        // @click="myTurn && card.playable ? $emit('play', card.card) : null"
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

    #cards .card:hover {
        -webkit-transform: scale(1.1);
        -ms-transform: scale(1.1);
        transform: scale(1.1);
        /*margin-bottom: 1.5em;*/
    }

    #cards .playable.card:hover {
        -webkit-transform: scale(1.1);
        -ms-transform: scale(1.1);
        transform: scale(1.1);
    }

    #cards .playable.card {
        margin-bottom: 1.5em;
    }
</style>