import Vue from 'vue'
import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import moxios from 'moxios'
import Vuex from 'vuex'
import ReceivePage from '@/components/ReceivePage.vue';
import web3 from 'web3'
import EthWallet from 'ethereumjs-wallet'

const wallet = EthWallet.generate()


const localVue = createLocalVue()

localVue.use(Vuex)

describe('ReceivePage', () => {
  let actions
  let store

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
  })

  afterEach(() => {
    moxios.uninstall()
  })

  // done callback is required for async tests
  it('downloads transaction history', (done) => {
    moxios.stubRequest(/api\.ethplorer\.io\/getAddressTransactions/, {
      status: 200,
      response: [{
        id: '1',
        to: wallet.getAddressString()
      }]
    })

    // new wrapper must be initialized in each test AFTER moxios.stubRequest
    const wrapper = shallowMount(ReceivePage, { store, localVue })

    moxios.wait(() => {
      let elems = wrapper.vm.transactions;
      expect(elems.length).toBe(1);
      expect(elems[0].to).toBe(wrapper.vm.address)
      done();
    })
  })
})
