import Vue from 'vue'
import router from './router'
import store from './store'
import validation from './validation'
import App from './App'
import VueFlashMessage from 'vue-flash-message'

Vue.config.productionTip = false;

Vue.use(VueFlashMessage, {
  method: 'notify',
  createShortcuts: false
})

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
