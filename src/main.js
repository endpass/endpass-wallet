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

Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(Notifications);
Vue.use(validation);
Vue.use(directives);
Vue.use(FaucetComponets);

Vue.use(VueAnalytics, {
  id: ENV.googleAnalyticsId,
  router,
  debug: {
    sendHitTask: ENV.isProduction,
  },
});

Vue.use(Intercom, { appId: ENV.intercomAppId });
Vue.use(UIComponents);

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});

if (!ENV.isProduction) {
  window.app = app;
}

export default app;
