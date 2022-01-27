import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
Vue.component('VueSlider', VueSlider)


import Treeselect from '@riophae/vue-treeselect'
Vue.component('Treeselect', Treeselect)
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)
import 'vue-select/dist/vue-select.css';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
//Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
