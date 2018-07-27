import Vue from 'vue';
import Intercom from 'vue-intercom';
import Notifications from 'vue-notification';
import router from './router';
import store from './store';
import validation from './validation';
import App from './App';

const isProduction = process.env.NODE_ENV === 'production';

Vue.config.productionTip = false;

Vue.use(Notifications);

Vue.use(Intercom, { appId: process.env.INTERCOM_APP_ID });

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
