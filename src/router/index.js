import Vue from 'vue';
import Router from 'vue-router';
import multiguard from 'vue-router-multiguard';
import { hasLoginGuard, privateWalletGuard } from './guards';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: () =>
        import(/* webpackChunkName: "HomePage" */ '@/components/pages/Home'),
    },
    {
      path: '/send',
      name: 'SendPage',
      component: () =>
        import(/* webpackChunkName: "SendPage" */ '@/components/pages/Send'),
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
    {
      path: '/tokens',
      name: 'TokensPage',
      component: () =>
        import(/* webpackChunkName: "TokensPage" */ '@/components/pages/Tokens'),
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/history',
      name: 'HistoryPage',
      component: () =>
        import(/* webpackChunkName: "HistoryPage" */ '@/components/pages/History'),
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/receive',
      name: 'ReceivePage',
      component: () =>
        import(/* webpackChunkName: "ReceivePage" */ '@/components/pages/Receive'),
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/new',
      name: 'NewWallet',
      component: () =>
        import(/* webpackChunkName: "NewWalletPage" */ '@/components/pages/NewWallet'),
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/import',
      name: 'ImportWallet',
      component: () =>
        import(/* webpackChunkName: "ImportWalletPage" */ '@/components/pages/ImportWallet'),
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/export',
      name: 'ExportWallet',
      component: () =>
        import(/* webpackChunkName: "ExportWalletPage" */ '@/components/pages/ExportWallet'),
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
    {
      path: '/settings',
      name: 'SettingsPage',
      component: () =>
        import(/* webpackChunkName: "SettingsPage" */ '@/components/pages/Settings'),
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/message',
      name: 'MessagePage',
      component: () =>
        import(/* webpackChunkName: "MessagePage" */ '@/components/pages/Message'),
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
    {
      path: '/transaction',
      name: 'TransactionPage',
      component: () =>
        import(/* webpackChunkName: "TransactionPage" */ '@/components/pages/Transaction'),
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
  ],
});
