import Vue from 'vue'
import axios from 'axios'
import moxios from 'moxios'
import { mount, shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import HistoryPage from '@/components/HistoryPage.vue';
import Web3 from 'web3'
import EthWallet from 'ethereumjs-wallet'
import { infuraConf } from '@/config.js'

const wallet = EthWallet.generate()


const localVue = createLocalVue()

localVue.use(Vuex)
describe('HistoryPage', () => {
  let actions
  let store
  let wrapper
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {
          activeAccount: wallet,
          pendingTransactions: [{"timestamp":1524505925,"from":"0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b","to":"0x7c59542b20002ed255598172cab48b86d865dfbb","hash":"0x7fcb1e71def6d0d353251831f46d60401e6321b5e0b0b135085be4688ca2a9b1","value":0.009979,"input":"0x","success":true}]
        },
        web3: {
          web3: {
            activeNet: 'Main'
          }
        }
      },
      actions
    })
    wrapper = shallow(HistoryPage, { store, localVue })
  })
  it('downloads data', () => {
    moxios.wait(() => {
      let request = moxios.requests.mostRecent()
      request.respondWith({
        status: 200,
        response: [{
          id: '1'
        }, {
          id: '2'
        }]
      }).then(function () {
        wrapper.vm.$nextTick(() => {
          let elems = wrapper.vm.transactions.length;
          expect(elems).toBe(2);
          done();
        })
      })
    })
  })
  it('concats data', () => {
    moxios.wait(() => {
      let request = moxios.requests.mostRecent()
      request.respondWith({
        status: 200,
        response: [{
          id: '1'
        }, {
          id: '2'
        }]
      }).then(function () {
        wrapper.vm.$nextTick(() => {
          let elems = wrapper.vm.processedTransactions.length;
          expect(elems).toBe(3);
          done();
        })
      })
    })
  })
})
