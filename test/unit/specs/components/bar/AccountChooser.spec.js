import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue';

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
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {
          hdWallet: null,
          wallets: [],
          wallet: null,
          balance: null,
        },
      },
      actions,
    });
    wrapper = shallow(AccountChooser, { store, localVue });
  });

  it('starts with no accounts', () => {
    expect(wrapper.vm.wallets.length).toBe(0);
    expect(wrapper.vm.selectedAccount).toBeUndefined();
  });
});
