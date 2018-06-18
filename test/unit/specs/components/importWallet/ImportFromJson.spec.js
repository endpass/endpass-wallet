import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import EthWallet from 'ethereumjs-wallet';
import ImportFromJson from '@/components/importWallet/ImportFromJson';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ImportFromJson', () => {
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
    wrapper = shallow(ImportFromJson, { store, localVue });
    // console.log(wrapper)
  });

  it('sets the correct default data', () => {
    expect(wrapper.vm.$data.jsonKeystorePassword).toBe('');
    expect(wrapper.vm.$data.fileName).toBe('');
    expect(wrapper.vm.$data.file).toBe(null);
  });

  it('correctly creates wallet with JSON key', () => {
    const fileContent =
      '{"version":3,"id":"1404626b-2315-42d8-9cbf-200e56438591","address":"4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b","crypto":{"ciphertext":"0c25f3bc2b7f3450e6876dd484d1ce5946a85d4bb95467e757635d0d9e87a4e0","cipherparams":{"iv":"de91c237823f0c8d6a88223fdd73917d"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"f766516fb5cf9dd4d72fe923f5c96c2ef7b95e7d05bd9a432cd8051149a760cd","n":262144,"r":8,"p":1},"mac":"92df30ff0cad5fd9409878ad70a5af74ff0156d8ad31ced9f56db920bba026a4"}}';

    wrapper.setData({
      jsonKeystorePassword: '123123',
    });

    expect(
      wrapper.vm.createWalletWithJson({
        target: { result: fileContent },
      }) instanceof EthWallet
    ).toBe(true);
  });

  it('correctly sets error with bad file', async () => {
    const fileContent = 'bad content for json';

    await expect(
      wrapper.vm.addWalletWithJson({
        target: { result: fileContent },
      })
    ).rejects.toThrow();
    expect(wrapper.vm.errors.has('fileName')).toBe(true);
  });
});
