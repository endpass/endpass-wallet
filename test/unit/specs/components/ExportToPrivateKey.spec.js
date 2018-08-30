import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import ExportToPrivateKey from '@/components/ExportToPrivateKey';
import { Wallet } from '@/class';
import { v3, v3password, privateKeyString } from 'fixtures/accounts';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('ExportToPrivateKey', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          state: {
            wallet: new Wallet(v3),
          },
        },
      },
    });
    wrapper = shallow(ExportToPrivateKey, { store, localVue });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ExportToPrivateKey');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    it('should correctly set the private key', async () => {
      await wrapper.vm.getPrivateKey(v3password);
      console.log(v3password, privateKeyString);
      expect(wrapper.vm.privateKey).toBe(privateKeyString);
    });
  });
});
