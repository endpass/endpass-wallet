import Vue from 'vue';
import Intercom from 'vue-intercom';
import VueAnalytics from 'vue-analytics';
import Notifications from 'vue-notification';
import UIComponents from '@endpass/ui';
import FaucetComponets from '@endpass/faucet';

import router from './router';
import store from './store';
import App from './App.vue';
import validation from './validation';
import directives from './directives';
import i18n from '@/locales/i18n';

Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(Notifications);
Vue.use(validation);
Vue.use(directives);
Vue.use(FaucetComponets);
Vue.use(VueAnalytics, {
  id: ENV.VUE_APP_GOOGLE_ANALYTICS_ID,
  router,
  debug: {
    sendHitTask: ENV.VUE_APP_IS_PRODUCTION,
  },
});

Vue.use(Intercom, { appId: ENV.VUE_APP_INTERCOM_APP_ID });
Vue.use(UIComponents);

// Make web3 global for integration tests
if (window.Cypress) {
  window.cypressTestResolver = new Promise(resolve => {
    window.startCypressTest = resolve;
  });
}

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App),
});

if (!ENV.VUE_APP_IS_PRODUCTION) {
  window.app = app;
}

export default app;
