import Vue from 'vue'
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ImportWallet from '../../../src/components/ImportWallet.vue'
import EthWallet from 'ethereumjs-wallet'
import HDKey from 'ethereumjs-wallet/hdkey'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('ImportWallet', () => {
  let actions
  let store
  let wrapper
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {},
      },
      actions
    })
    wrapper = shallow(ImportWallet, { store, localVue })
  })

  it('correctly creates wallet with private key', () => {
    const vm = new Vue(ImportWallet).$mount()
    vm.privateKey = '4daf66f4ffed6d47e75d22e2c962d1f9a36550dc2cfda4bfb5da741bdc97d6ba';
    expect(vm.createWalletWithKey() instanceof EthWallet).toBe(true);
  })
  it('correctly creates wallet with prase', () => {
    const vm = new Vue(ImportWallet).$mount()
    vm.hdkeyPrase = 'salt suit force stomach lounge endless soul junk join leg sort aware';
    expect(vm.createWalletWithPrase() instanceof EthWallet).toBe(true);
  })

  it('defaults to import by seed phrase', () => {
    expect(wrapper.vm.importType).toBe('seedPhrase');
    expect(wrapper.contains('.import-seed-phrase')).toBe(true)
    expect(wrapper.contains('.import-private-key')).toBe(false)
  })

  it('shows import by private key', () => {
    wrapper.setData({importType: 'privateKey'})
    expect(wrapper.contains('.import-seed-phrase')).toBe(false)
    expect(wrapper.contains('.import-private-key')).toBe(true)
  })
})
