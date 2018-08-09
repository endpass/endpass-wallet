import Vue from 'vue';
import Router from 'vue-router';
import multiguard from 'vue-router-multiguard';

import HomePage from '@/components/pages/Home';
import SendPage from '@/components/pages/Send';
import HistoryPage from '@/components/pages/History';
import ReceivePage from '@/components/pages/Receive';
import TokensPage from '@/components/pages/Tokens';
import NewWallet from '@/components/pages/NewWallet';
import ImportWallet from '@/components/pages/ImportWallet';
import ExportWallet from '@/components/pages/ExportWallet';
import SettingsPage from '@/components/pages/Settings';
import MessagePage from '@/components/pages/Message';

import { hasLoginGuard, privateWalletGuard } from './guards';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
    },
    {
      path: '/send',
      name: 'SendPage',
      component: SendPage,
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
    {
      path: '/tokens',
      name: 'TokensPage',
      component: TokensPage,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/history',
      name: 'HistoryPage',
      component: HistoryPage,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/receive',
      name: 'ReceivePage',
      component: ReceivePage,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/new',
      name: 'NewWallet',
      component: NewWallet,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/import',
      name: 'ImportWallet',
      component: ImportWallet,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/export',
      name: 'ExportWallet',
      component: ExportWallet,
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
    {
      path: '/settings',
      name: 'SettingsPage',
      component: SettingsPage,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/message',
      name: 'MessagePage',
      component: MessagePage,
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
  ],
});
