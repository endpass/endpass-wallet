import Vue from 'vue';
import Router from 'vue-router';
import multiguard from 'vue-router-multiguard';
import { hasLoginGuard, privateWalletGuard } from './guards';

import HomePage from '@/components/pages/Home';
import SendPage from '@/components/pages/Send';
import TokensPage from '@/components/pages/Tokens';
import HistoryPage from '@/components/pages/History';
import ReceivePage from '@/components/pages/Receive';
import NewWalletPage from '@/components/pages/NewWallet';
import ImportWalletPage from '@/components/pages/ImportWallet';
import ExportWalletPage from '@/components/pages/ExportWallet';
import SettingsPage from '@/components/pages/Settings';
import MessagePage from '@/components/pages/Message';
import TransactionPage from '@/components/pages/Transaction';

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
      component: NewWalletPage,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/import',
      name: 'ImportWallet',
      component: ImportWalletPage,
      beforeEnter: hasLoginGuard,
    },
    {
      path: '/export',
      name: 'ExportWallet',
      component: ExportWalletPage,
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
    {
      path: '/transaction',
      name: 'TransactionPage',
      component: TransactionPage,
      beforeEnter: multiguard([hasLoginGuard, privateWalletGuard]),
    },
  ],
});
