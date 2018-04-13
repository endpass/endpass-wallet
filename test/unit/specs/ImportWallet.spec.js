import Vue from 'vue'
import MyComponent from '../../../src/components/ImportWallet.vue'

describe('MyComponent', () => {
  it('sets the correct default data', () => {
    expect(typeof MyComponent.data).toBe('function')
    const defaultData = MyComponent.data()
    expect(defaultData.privateKey).toBe('')
    expect(defaultData.hdkeyPrase).toBe('')
    expect(defaultData.privateKeyError).toBe(false)
    expect(defaultData.hdkeyPraseError).toBe(false)
    expect(defaultData.hdWallet).toBe(null)
  })

  it('correctly sets error with bad data', () => {
    const vm = new Vue(MyComponent).$mount()
    vm.privateKey = '123';
    vm.hdkeyPrase = '123';
    vm.addWalletWithKey();
    vm.addWalletWithPrase();
    expect(vm.privateKeyError).toBe(true);
    expect(vm.hdkeyPraseError).toBe(true);
  })

})
