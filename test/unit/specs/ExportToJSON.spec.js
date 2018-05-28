import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ExportToJson from '@/components/ExportToJson.vue';
import Web3 from 'web3'
import EthWallet from 'ethereumjs-wallet'
import { infuraConf } from '@/config.js'

const wallet = EthWallet.generate()


const localVue = createLocalVue()

localVue.use(Vuex)
describe('ExportToJson', () => {
  let store
  let wrapper
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {
          activeAccount: wallet
        }
      }
    })
    wrapper = shallowMount(ExportToJson, { store, localVue })
  })
  it('creates json from wallet', done => {
    wrapper.vm.runExportJsonWorker().then(jsonData => {
      expect(jsonData).toBeTruthy();
      let walletData = JSON.parse(jsonData)
      expect(walletData.version).toBe(3)
      expect('0x'+walletData.address).toBe(wallet.getAddressString())
      done()
    })
  })
})
