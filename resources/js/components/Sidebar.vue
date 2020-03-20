<template>
    <div id="sidebar" class="ui top aligned grid">
        <div class="column">
            <h2 id="header" class="ui red header">
                <i class="red heart icon"></i>
                <div class="content">
                    barbu.js
                </div>
            </h2>
            <ul>
                <li v-for="log in logs" v-html="_.replace(log, '\n', '<br>')"></li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['logs']
    }
</script>

<style>
    #sidebar {
        background-color: #ce6868;
        max-height: 100vh;
        overflow-y: scroll;
        scrollbar-width: none;
    }

    #sidebar .header {
        position: fixed;
        width: 100%;
        padding: 0.7em 0 0.5em 0.5em;
        background-color: white;
    }

    #sidebar .heart.icon {
        animation: pulse 1s infinite;
    }

    #sidebar ul {
        list-style-type: none;
        padding: 0;
        margin: 4.4em 0 0 0;
    }

    #sidebar li {
        padding: 5px 10px;
    }

    #sidebar li:nth-child(even) {
        background: #ffbebe;
    }

    #sidebar li:nth-child(odd) {
        background: #ffd7d7;
    }

    @keyframes pulse {
        10% {transform: scale(1.1)}
    }
</style>