// CSS
import 'vue-material/dist/vue-material.css'

import 'babel-polyfill'
import './plugins'
import Vue from 'vue'
import apolloProvider from './apollo'
import App from './components/App.vue'

new Vue({
	el: '#app',
	apolloProvider,
	...App,
})
