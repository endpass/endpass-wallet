import Vue from 'vue'
import Router from 'vue-router'

import HomePage from '@/components/HomePage'
import SendPage from '@/components/SendPage'
import HistoryPage from '@/components/HistoryPage'
import ReceivePage from '@/components/ReceivePage'
import NewWallet from '@/components/NewWallet'
import ImportWallet from '@/components/ImportWallet'

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
      component: SendPage
    },
    {
      path: '/history',
      name: 'HistoryPage',
      component: HistoryPage
    },
    {
      path: '/receive',
      name: 'ReceivePage',
      component: ReceivePage
    },
    {
      path: '/new',
      name: 'NewWallet',
      component: NewWallet
    },
    {
      path: '/import',
      name: 'ImportWallet',
      component: ImportWallet
    }
  ]
})
