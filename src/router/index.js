import Vue from 'vue'
import Router from 'vue-router'

import HomePage from '@/components/HomePage'
import SendPage from '@/components/SendPage'
import HistoryPage from '@/components/HistoryPage'
import ReceivePage from '@/components/ReceivePage'
import TokensPage from '@/components/TokensPage'
import NewWallet from '@/components/NewWallet'
import ImportWallet from '@/components/ImportWallet'
import ExportWallet from '@/components/ExportWallet'

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
      beforeEnter: hasWalletGuard
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
      beforeEnter: hasWalletGuard
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
