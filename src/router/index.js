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

import {
  hasLoginGuard,
  hasWalletGuard,
  privateWalletGuard,
  noWalletGuard,
} from './guards';

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
      beforeEnter: multiguard([
        hasLoginGuard,
        hasWalletGuard,
        privateWalletGuard,
      ]),
    },
    {
      path: '/tokens',
      name: 'TokensPage',
      component: TokensPage,
      beforeEnter: multiguard([hasLoginGuard, hasWalletGuard]),
    },
    {
      path: '/history',
      name: 'HistoryPage',
      component: HistoryPage,
      beforeEnter: multiguard([hasLoginGuard, hasWalletGuard]),
    },
    {
      path: '/receive',
      name: 'ReceivePage',
      component: ReceivePage,
      beforeEnter: multiguard([hasLoginGuard, hasWalletGuard]),
    },
    {
      path: '/new',
      name: 'NewWallet',
      component: NewWallet,
      beforeEnter: multiguard([hasLoginGuard, noWalletGuard]),
    },
    {
      path: '/import',
      name: 'ImportWallet',
      component: ImportWallet,
      beforeEnter: multiguard([hasLoginGuard, noWalletGuard]),
    },
    {
      path: '/export',
      name: 'ExportWallet',
      component: ExportWallet,
      beforeEnter: multiguard([
        hasLoginGuard,
        hasWalletGuard,
        privateWalletGuard,
      ]),
    },
    {
      path: '/settings',
      name: 'SettingsPage',
      component: SettingsPage,
      beforeEnter: multiguard([hasLoginGuard, hasWalletGuard]),
    },
    {
      path: '/message',
      name: 'MessagePage',
      component: MessagePage,
      beforeEnter: multiguard([hasLoginGuard, hasWalletGuard]),
    },
  ],
});
