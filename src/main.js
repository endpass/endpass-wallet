import Vue from 'vue'
import router from './router'
import store from './store'
import App from './App'
import VueResource from 'vue-resource';
import VueFlashMessage from 'vue-flash-message'
import VModal from 'vue-js-modal'

Vue.config.productionTip = false;

Vue.use(VueResource);

Vue.use(VModal, {dynamic: true});

Vue.use(VueFlashMessage, {
  method: 'notify',
  createShortcuts: false
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
