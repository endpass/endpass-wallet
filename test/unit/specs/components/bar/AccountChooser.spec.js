import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue';
import { generateStubs } from '@/utils/testUtils';

const localVue = createLocalVue();

localVue.use(Vuex);

class mockAccount {
  constructor(address) {
    this.address = address;
  }

  getChecksumAddressString() {
    return this.address;
  }
}

describe('AccountChooser', () => {
  let actions;
  let store;
  let wrapper;
  let options;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {
          hdWallet: null,
          wallets: {},
          wallet: null,
          balance: null,
          address: {
            getChecksumAddressString: () => '0xkdjkj',
          },
        },
      },
      actions,
    });
    options = { store, localVue };
    wrapper = shallow(AccountChooser, options);
  });

  describe('behavior', () => {
    it('should starts with no accounts', () => {
      expect(Object.keys(wrapper.vm.wallets)).toHaveLength(0);
      expect(wrapper.vm.selectedAccount).toBeUndefined();
    });

    it('should provide an account choice', () => {
      wrapper = shallow(AccountChooser, {
        ...options,
        stubs: generateStubs(AccountChooser),
      });

      wrapper.setComputed({
        address: '0xkjdf',
        wallets: {
          '0xkjdf': {},
          '0x1123': {},
        },
      });

      const multiselect = wrapper.find('vue-multiselect');

      expect(wrapper.vm.walletsAddresses).toHaveLength(2);
      expect(multiselect.attributes().options).toBe('0xkjdf,0x1123');
      expect(multiselect.attributes().value).toBe('kjdf');
    });
  });
});
