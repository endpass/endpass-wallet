import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import { allTokens, tokens, tokensMappedByAddresses } from 'fixtures/tokens';
import validation from '@/validation';
import { wrapShallowMountFactory } from '@/testUtils';

import TokensPage from '@/components/pages/Tokens.vue';

import setupI18n from '@/locales/i18nSetup';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Vuex);
localVue.use(Notifications);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('TokensPage', () => {
  let wrapper;
  let wrapperFactory;
  let actions;
  let getters;
  let store;
  let options;

  beforeEach(() => {
    actions = {
      updateTokenPrice: jest.fn(),
      saveTokenAndSubscribe: jest.fn(),
      deleteTokenAndUnsubscribe: jest.fn(),
      getAllTokens: jest.fn(() => allTokens),
    };

    getters = {
      savedCurrentNetworkTokens: () => [{}],
      net: () => 1,
      allCurrentAccountFullTokens: () => tokensMappedByAddresses,
    };

    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: {
            settings: {
              fiatCurrency: 'USD',
            },
          },
        },
        tokens: {
          namespaced: true,
          state: {
            prices: null,
            networkTokens: tokensMappedByAddresses,
          },
          actions,
          getters,
        },
        price: {
          namespaced: true,
          state: {
            price: null,
          },
        },
        web3: {
          namespaced: true,
          state: {
            activeNet: {
              id: 1,
            },
          },
        },
      },
    });

    options = {
      store,
      localVue,
      i18n,
    };
    wrapperFactory = wrapShallowMountFactory(TokensPage, options);
  });

  afterEach(() => {
    actions.updateTokenPrice.mockClear();
    actions.saveTokenAndSubscribe.mockClear();
    actions.deleteTokenAndUnsubscribe.mockClear();
    actions.getAllTokens.mockClear();
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = wrapperFactory();
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('TokensPage');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('v-spinner', () => {
      it('should render v-spinner', () => {
        wrapper = wrapperFactory({
          computed: {
            isLoading: true,
          },
        });

        expect(wrapper.find('v-spinner-stub').exists()).toBe(true);
      });

      it('should not render v-spinner', () => {
        wrapper = wrapperFactory({
          computed: {
            isLoading: false,
          },
        });

        expect(wrapper.find('v-spinner-stub').exists()).toBe(false);
      });
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = wrapperFactory();
    });

    describe('search', () => {
      it('should correctly find the user tokens', () => {
        expect(wrapper.vm.userTokensList).toHaveLength(2);

        wrapper.setData({
          userTokenQuery: 'fst',
        });

        expect(wrapper.vm.userTokensList).toHaveLength(1);
      });

      it('should correctly find token in list', () => {
        wrapper = wrapperFactory({
          computed: {
            allCurrentAccountFullTokens: {},
          },
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(2);
        wrapper.setData({
          networkTokenQuery: '',
        });
        expect(wrapper.vm.filteredTokens).toHaveLength(2);

        wrapper.setData({
          networkTokenQuery: 'FST',
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(1);
        expect(wrapper.vm.filteredTokens[0]).toEqual(tokens[0]);

        wrapper.setData({
          networkTokenQuery: '',
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(2);

        wrapper.setData({
          networkTokenQuery: 'second',
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(1);
        expect(wrapper.vm.filteredTokens[0]).toEqual(tokens[1]);
      });

      it('should filter out user tokens', async () => {
        expect.assertions(3);

        wrapper = wrapperFactory({
          computed: {
            allCurrentAccountFullTokens: {},
          },
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(2);

        wrapper.setData({
          networkTokenQuery: 'first',
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(1);
        expect(wrapper.vm.filteredTokens[0]).toEqual(tokens[0]);
      });

      it('should contains empty array if current net is not main', () => {
        wrapper = wrapperFactory({
          computed: {
            activeNetId: 3,
          },
        });

        expect(wrapper.vm.filteredTokens).toEqual([]);
      });
    });
  });
});
