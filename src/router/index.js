import Vue from 'vue'
import Router from 'vue-router'
import multiguard from 'vue-router-multiguard';

import HomePage from '@/components/pages/Home'
import SendPage from '@/components/pages/Send'
import HistoryPage from '@/components/pages/History'
import ReceivePage from '@/components/pages/Receive'
import TokensPage from '@/components/pages/Tokens'
import NewWallet from '@/components/pages/NewWallet'
import ImportWallet from '@/components/pages/ImportWallet'
import ExportWallet from '@/components/pages/ExportWallet'

import store from '../store'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage
    },
    {
      path: '/send',
      name: 'SendPage',
      component: SendPage,
      beforeEnter: multiguard([hasWalletGuard, privateWalletGuard])
    },
    {
      path: '/tokens',
      name: 'TokensPage',
      component: TokensPage,
      beforeEnter: hasWalletGuard
    },
    {
      path: '/history',
      name: 'HistoryPage',
      component: HistoryPage,
      beforeEnter: hasWalletGuard
    },
    {
      path: '/receive',
      name: 'ReceivePage',
      component: ReceivePage,
      beforeEnter: hasWalletGuard
    },
    {
      path: '/new',
      name: 'NewWallet',
      component: NewWallet,
      beforeEnter: noWalletGuard
    },
    {
      path: '/import',
      name: 'ImportWallet',
      component: ImportWallet,
      beforeEnter: noWalletGuard
    },
    {
      path: '/export',
      name: 'ExportWallet',
      component: ExportWallet,
      beforeEnter: multiguard([hasWalletGuard, privateWalletGuard])
    }
  ]
})
function hasWalletGuard (to, from, next) {
  if(store.state.accounts.activeAccount) {
    next();
  } else {
    next(from.fullPath);
  }
}

function noWalletGuard(to, from, next) {
  if(!store.state.accounts.activeAccount) {
    next();
  } else {
    next(from.fullPath);
  }
}

function privateWalletGuard(to, from, next) {
  if(!store.state.accounts.activeAccount._privKey !== null) {
    next();
  } else {
    next(from.fullPath);
  }
}
