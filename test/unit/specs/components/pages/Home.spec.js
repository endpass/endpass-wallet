import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { testUtils } from '@endpass/utils';
import { checksumAddress } from 'fixtures/accounts';

import Home from '@/components/pages/Home';

describe('Home page', () => {
  let wrapper;
  const localVue = createLocalVue();

  localVue.use(Vuex);

  beforeEach(() => {
    const store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          getters: {
            isLoggedIn: () => true,
          },
        },
        accounts: {
          namespaced: true,
          getters: {
            isPublicAccount: jest.fn(),
            isHardwareAccount: jest.fn(),
            isLoggedIn: jest.fn(),
            balance: jest.fn(),
            currentAddressString: jest.fn(),
          },
        },
        web3: {
          namespaced: true,
          state: {},
        },
        tokens: {
          namespaced: true,
          getters: {
            allCurrentAccountFullTokens: jest.fn(),
            currentNetUserFullTokens: jest.fn().mockReturnValue({}),
            currentAccountFullTokens: jest.fn().mockReturnValue({}),
          },
        },
      },
    });
    wrapper = shallow(Home, {
      store,
      localVue,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('Home');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should render export button when exportable account', () => {
      wrapper.setComputed({
        isExportable: true,
        address: checksumAddress,
      });

      expect(
        wrapper.find('[data-test=export-wallet-button]').exists(),
      ).toBeTruthy();
    });

    it('should not render export button when is not exportable account', () => {
      wrapper.setComputed({ isExportable: false });

      expect(
        wrapper.find('[data-test=export-wallet-button]').exists(),
      ).toBeFalsy();
    });
  });
});
