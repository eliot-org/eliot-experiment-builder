import Vue from 'vue'

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

import VueJsonPretty from 'vue-json-pretty';
Vue.component('VueJsonPretty', VueJsonPretty)
import 'vue-json-pretty/lib/styles.css';

import '@mdi/font/css/materialdesignicons.css' 
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify)
let vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi', // default - only for display purposes
  },
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
//Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  vuetify,
  template: '<App/>'
}).$mount('#app')
