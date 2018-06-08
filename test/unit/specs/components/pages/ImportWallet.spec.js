import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import validation from '@/validation';
import ImportWallet from '@/components/pages/ImportWallet.vue';
import EthWallet from 'ethereumjs-wallet';
import HDKey from 'ethereumjs-wallet/hdkey';
import LocalStorageMock from '../../../localStorageMock.js';
import AddressWallet from '@/services/addressWallet.js'

global.localStorage = LocalStorageMock;

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ImportWallet', () => {
  let actions;
  let store;
  let wrapper;
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {},
      },
      actions,
    });
    wrapper = shallow(ImportWallet, { store, localVue });
  });

  it('sets the correct default data', () => {
    expect(typeof ImportWallet.data).toBe('function');
    const defaultData = ImportWallet.data();
    expect(defaultData.privateKey).toBe('');
    expect(defaultData.hdkeyPhrase).toBe('');
  });

  it('correctly creates wallet with private key', () => {
    const vm = new Vue(ImportWallet).$mount();
    vm.privateKey =
      '4daf66f4ffed6d47e75d22e2c962d1f9a36550dc2cfda4bfb5da741bdc97d6ba';
    expect(vm.createWalletWithPrivateKey() instanceof EthWallet).toBe(true);
  });
  it('correctly creates wallet with JSON key', () => {
    const vm = new Vue(ImportWallet).$mount();
    let fileContent =
      '{"version":3,"id":"1404626b-2315-42d8-9cbf-200e56438591","address":"4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b","crypto":{"ciphertext":"0c25f3bc2b7f3450e6876dd484d1ce5946a85d4bb95467e757635d0d9e87a4e0","cipherparams":{"iv":"de91c237823f0c8d6a88223fdd73917d"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"f766516fb5cf9dd4d72fe923f5c96c2ef7b95e7d05bd9a432cd8051149a760cd","n":262144,"r":8,"p":1},"mac":"92df30ff0cad5fd9409878ad70a5af74ff0156d8ad31ced9f56db920bba026a4"}}';
    vm.jsonKeystorePassword = '123123';
    expect(
      vm.createWalletWithJson({ target: { result: fileContent } }) instanceof
        EthWallet
    ).toBe(true);
  });
  it('correctly creates wallet with prase', () => {
    const vm = new Vue(ImportWallet).$mount();
    vm.hdkeyPhrase =
      'salt suit force stomach lounge endless soul junk join leg sort aware';
    let key = vm.createWalletWithPrase();
    expect(key instanceof HDKey).toBe(true);
    let wallet = key.deriveChild(0).getWallet()
    expect(wallet.getAddressString()).toBe('0x4ce2109f8db1190cd44bc6554e35642214fbe144');
  });
  it('correctly creates wallet with address', () => {
    const vm = new Vue(ImportWallet).$mount()
    vm.address = '0x2f015c60e0be116b1f0cd534704db9c92118fb6a';
    let wallet = vm.createWalletWithAddress();
    expect(wallet instanceof AddressWallet).toBe(true);
    expect(wallet.getAddressString()).toEqual(vm.address);
  });
  it('correctly sets error with bad phrase', async () => {
    const vm = new Vue(ImportWallet).$mount();
    await expect(vm.addWalletWithPhrase()).rejects.toThrow();
    expect(vm.errors.has('hdkeyPhrase')).toBe(true);
  });

  it('correctly sets error with private bad key', async () => {
    const vm = new Vue(ImportWallet).$mount();
    await expect(vm.addWalletWithPrivateKey()).rejects.toThrow();
    expect(vm.errors.has('privateKey')).toBe(true);
  });

  it('correctly sets error with bad address', async () => {
    const vm = new Vue(ImportWallet).$mount();
    await expect(vm.addWalletWithAddress()).rejects.toThrow();
    expect(vm.errors.has('address')).toBe(true);
  });


  it('defaults to import by seed phrase', () => {
    expect(wrapper.vm.importType).toBe('seedPhrase');
    expect(wrapper.contains('.import-seed-phrase')).toBe(true);
    expect(wrapper.contains('.import-private-key')).toBe(false);
  });

  it('shows import by private key', () => {
    wrapper.setData({ importType: 'privateKey' });
    expect(wrapper.contains('.import-seed-phrase')).toBe(false);
    expect(wrapper.contains('.import-private-key')).toBe(true);
  });
});
