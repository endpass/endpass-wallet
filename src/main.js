import Vue from 'vue';
import Notifications from 'vue-notification';
import router from './router';
import store from './store';
import validation from './validation';
import App from './App';
import './directives';

Vue.config.productionTip = false;

Vue.use(Notifications);

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});

if (process.env.NODE_ENV !== 'production') {
  window.app = app;
}

export default app;
