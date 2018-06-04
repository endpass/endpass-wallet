import Vue from 'vue'
import axios from 'axios'
import moxios from 'moxios'
import { mount, shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import HistoryPage from '@/components/pages/History.vue';
import Web3 from 'web3'
import { infuraConf } from '@/config.js'
import ethereumWalletMock from '../../../ethereumWalletMock.js';

const wallet = ethereumWalletMock;


const localVue = createLocalVue()

localVue.use(Vuex)
describe('HistoryPage', () => {
  let actions
  let store
  let wrapper
  beforeEach(() => {
    moxios.install()
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
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('downloads transaction history', (done) => {
    moxios.stubRequest(/api\.ethplorer\.io\/getAddressTransactions/, {
      status: 200,
      response: [{
        id: '1',
        to: wallet.getAddressString()
      }]
    })

    moxios.stubRequest(/api\.ethplorer\.io\/getAddressHistory/, {
      status: 200,
      response: {
        operations: [
          {
            id: '2',
            from: wallet.getAddressString()
          }
        ] 
      }
    })

    // new wrapper must be initialized in each test AFTER moxios.stubRequest
    const wrapper = shallow(HistoryPage, { store, localVue })

    moxios.wait(() => {
      let elems = wrapper.vm.transactions;
      expect(elems.length).toBe(2);
      expect(elems[0].to).toBe(wrapper.vm.address)
      done();
    })
  })

  it('concats transactions', (done) => {
    moxios.stubRequest(/api\.ethplorer\.io\/getAddressTransactions/, {
      status: 200,
      response: [{
        id: '1',
        to: wallet.getAddressString()
      }]
    })

    moxios.stubRequest(/api\.ethplorer\.io\/getAddressHistory/, {
      status: 200,
      response: {
        operations: [
          {
            id: '2',
            from: wallet.getAddressString()
          }
        ] 
      }
    })

    // new wrapper must be initialized in each test AFTER moxios.stubRequest
    const wrapper = shallow(HistoryPage, { store, localVue })

    moxios.wait(() => {
      wrapper.vm.$nextTick(() => {
        let elems = wrapper.vm.processedTransactions;
        expect(elems.length).toBe(3);
        expect(elems[1].to).toBe(wrapper.vm.address)
        expect(elems[2].timestamp).toBe(store.state.accounts.pendingTransactions[0].timestamp);
        done();
      })
    })
  })
})
