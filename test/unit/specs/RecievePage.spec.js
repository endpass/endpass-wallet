import Vue from 'vue'
import VueResource from 'vue-resource';
import { mount, shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ReceivePage from '../../../src/components/ReceivePage.vue';
import web3 from 'web3'
import EthWallet from 'ethereumjs-wallet'

const wallet = EthWallet.generate()


const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueResource);
localVue.http.interceptors.unshift((request, next) => {
  next(
    request.respondWith(
      [{
        "timestamp":1524505925,
        "from":"0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b",
        "to":wallet.getAddressString(),
        "hash":"0x7fcb1e71def6d0d353251831f46d60401e6321b5e0b0b135085be4688ca2a9b1",
        "value":0.009979,
        "input":"0x","success":true
      },{"timestamp":1524499379,
      "from":"0xd61a9dc425c56933c2dc2132d5dcdf3291981202",
      "to":"0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b",
      "hash":"0xd862932e58c515f47372287d32ddaafeb5b0959eceee5610d6de1abcff1ce92c",
      "value":0.01,
      "input":"0x",
      "success":true}]
    )
  );
})
describe('ReceivePage', () => {
  let actions
  let store
  let wrapper
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {
          activeAccount: wallet        },
        web3: {
          web3: web3
        }
      },
      actions
    })
    wrapper = shallow(ReceivePage, { store, localVue })
  })
  it('downloads and filters data', () => {
    setTimeout(()=>{
      let elems = wrapper.vm.transactions.length;
      expect(elems).toBe(1);
      done()
    },500);
  })
})
