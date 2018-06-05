import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import validation from '@/validation';
import ImportWallet from '@/components/pages/ImportWallet.vue';
import EthWallet from 'ethereumjs-wallet';
import HDKey from 'ethereumjs-wallet/hdkey';
import LocalStorageMock from '../../../localStorageMock.js';

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
    expect(vm.createWalletWithPrase() instanceof HDKey).toBe(true);
  });
  it('correctly creates wallet with public key', () => {
    const vm = new Vue(ImportWallet).$mount()
    vm.publicKey = '0935f10939786f4d95e2c3d3a615b334ea35ad6b9cab87ac50c7410c819d191e36e7307e180c3f95c4080f957298b3a8bc13f562fa5087076da534feb5b52552';
    expect(vm.createWalletWithPublicKey() instanceof EthWallet).toBe(true);
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

  it('correctly sets error with public bad key', async () => {
    const vm = new Vue(ImportWallet).$mount();
    await expect(vm.addWalletWithPublicKey()).rejects.toThrow();
    expect(vm.errors.has('publicKey')).toBe(true);
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
