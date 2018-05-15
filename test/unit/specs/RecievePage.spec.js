import Vue from 'vue'
import { mount, shallow, createLocalVue } from '@vue/test-utils'
import axios from 'axios'
import moxios from 'moxios'
import Vuex from 'vuex'
import ReceivePage from '../../../src/components/ReceivePage.vue';
import web3 from 'web3'
import EthWallet from 'ethereumjs-wallet'

const wallet = EthWallet.generate()


const localVue = createLocalVue()

localVue.use(Vuex)

describe('ReceivePage', () => {
  let actions
  let store
  let wrapper
  beforeEach(() => {
    moxios.install()
    store = new Vuex.Store({
      state: {
        accounts: {
          activeAccount: wallet
        },
        web3: {
          web3: web3
        }
      },
      actions
    })
    wrapper = shallow(ReceivePage, { store, localVue })
  })
  it('downloads data', () => {
    moxios.wait(() => {
      let request = moxios.requests.mostRecent()
      request.respondWith({
        status: 200,
        response: [{
          id: '1'
        }]
      }).then(function () {
        wrapper.vm.$nextTick(() => {
          let elems = wrapper.vm.transactions.length;
          expect(elems).toBe(1);
          done();
        })
      })
    })
  })
})
