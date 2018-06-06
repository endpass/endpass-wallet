import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

class mockAccount {
  constructor(address) {
    this.address = address;
  }

  getAddressString() {
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
          accounts: [],
          activeAccount: null,
          balance: null,
        },
      },
      actions,
    });
    wrapper = shallow(AccountChooser, { store, localVue });
  });

  it('starts with no accounts', () => {
    expect(wrapper.vm.selectedAccountId).toBe(0);
    expect(wrapper.vm.accounts.length).toBe(0);
    expect(wrapper.vm.selectedAccount).toBeUndefined();
  });

  it('updates active account in the store', () => {
    const accounts = [new mockAccount('abc'), new mockAccount('def')];
    store.state.accounts.accounts = accounts;
    expect(wrapper.vm.accounts).toEqual(accounts);

    store.state.accounts.activeAccount = accounts[1];
    wrapper.setData({ selectedAccountId: 1 });
    expect(wrapper.vm.selectedAccount).toBe(accounts[1]);
    expect(wrapper.vm.activeAccount.getAddressString()).toBe('def');
  });
});