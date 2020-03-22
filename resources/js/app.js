import Vue from 'vue'
import VueSocketIOExt from 'vue-socket.io-extended'
import io from 'socket.io-client'
import App from '@/App.vue'

var _ = require('lodash')
Vue.prototype._ = _

require('fomantic-ui-css/semantic.min.js')

const socket = io()

Vue.use(VueSocketIOExt, socket)

new Vue({
    render: h => h(App),
}).$mount('#app')