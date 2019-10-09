import VueRouter from 'vue-router';
import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { checksumAddress } from 'fixtures/accounts';
import { wrapShallowMountFactory } from '@/testUtils';

import Home from '@/components/pages/Home';
import setupI18n from '@/locales/i18nSetup';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Vuex);
localVue.use(VueRouter);

describe('Home page', () => {
  let wrapper;
  let wrapperFactory;
  let router;

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
          state: {
            activeNet: { id: '' },
          },
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
    router = new VueRouter();

    wrapperFactory = wrapShallowMountFactory(Home, {
      i18n,
      store,
      localVue,
      sync: false,
      router,
    });

    wrapper = wrapperFactory();
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
      wrapper = wrapperFactory({
        computed: {
          isExportable: true,
          address: checksumAddress,
        },
      });

      expect(
        wrapper.find('[data-test=export-wallet-button]').exists(),
      ).toBeTruthy();
    });

    it('should not render export button when is not exportable account', () => {
      wrapper = wrapperFactory({
        computed: {
          isExportable: false,
        },
      });

      expect(
        wrapper.find('[data-test=export-wallet-button]').exists(),
      ).toBeFalsy();
    });
  });
});
