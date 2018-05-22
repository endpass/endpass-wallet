import Vue from 'vue'
import router from './router'
import store from './store'
import validation from './validation'
import App from './App'

Vue.config.productionTip = false;

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
