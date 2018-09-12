import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import { generateStubs } from '@/utils/testUtils';
import wallet from '../../../fixtures/wallet';
import { address } from '../../../fixtures/accounts';
import AccountChooser from '@/components/bar/AccountChooser.vue';

const localVue = createLocalVue();
const checksumAddress = wallet.getChecksumAddressString();

localVue.use(Vuex);

describe('AccountChooser', () => {
  let actions;
  let store;
  let wrapper;

  beforeEach(() => {
    actions = {
      selectWallet: jest.fn(),
    };
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          state: {
            wallets: {
              [checksumAddress]: wallet,
              [address]: {},
            },
            wallet,
            address: wallet,
          },
          actions,
        },
      },
    });
    wrapper = shallow(AccountChooser, {
      store,
      localVue,
      stubs: generateStubs(AccountChooser),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('account-chooser');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('computed', () => {
    describe('activeAddress', () => {
      it('should get activeAddress correctly', () => {
        expect(wrapper.vm.activeAddress).toBe(
          checksumAddress.replace(/^0x/, ''),
        );
      });

      it('should set activeAddress with correct action', () => {
        wrapper.vm.activeAddress = checksumAddress;
        expect(actions.selectWallet).toBeCalledWith(
          expect.any(Object),
          checksumAddress,
          undefined,
        );
      });
    });
    describe('walletsAddresses', () => {
      it('should get walletsAddresses correctly ', () => {
        expect(wrapper.vm.walletsAddresses.length).toBe(2);
        expect(wrapper.vm.walletsAddresses).toContain(checksumAddress);
        expect(wrapper.vm.walletsAddresses).toContain(address);
      });
    });
  });

  describe('filters', () => {
    describe('truncateAddr', () => {
      it('should truncate filter correctly', () => {
        expect(wrapper.vm.$options.filters.truncateAddr(address)).toBe(
          '0xB1...4C3c',
        );
      });
      it('should return empty string if addres is false', () => {
        expect(wrapper.vm.$options.filters.truncateAddr(false)).toBe('');
      });
    });
  });

  describe('behavior', () => {
    it('should starts with no accounts', () => {
      wrapper.setComputed({
        wallets: {},
      });
      expect(Object.keys(wrapper.vm.wallets)).toHaveLength(0);
      expect(wrapper.vm.selectedAccount).toBeUndefined();
    });

    it('should provide an account choice', () => {
      const multiselect = wrapper.find('vue-multiselect');
      expect(wrapper.vm.walletsAddresses).toHaveLength(2);
      expect(multiselect.attributes().options).toBe(
        `${checksumAddress},${address}`,
      );
      expect(multiselect.attributes().value).toBe(
        checksumAddress.replace(/^0x/, ''),
      );
    });
  });
});
