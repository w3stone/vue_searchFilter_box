// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import VueAxios from 'vue-axios'
import store from './store/store'
//
import {dataGet} from './assets/scripts/ajaxFn.js'

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(VueAxios, axios);

//全局
Vue.prototype.$dataGet = dataGet;


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
