import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import '@/validation';
import { allTokens, tokens, tokensMappedByAddresses } from 'fixtures/tokens';

import TokensPage from '@/components/pages/Tokens.vue';
import { generateStubs } from '@/utils/testUtils';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Notifications);

describe('TokensPage', () => {
  let wrapper;
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
    };
  });

  afterEach(() => {
    actions.updateTokenPrice.mockClear();
    actions.saveTokenAndSubscribe.mockClear();
    actions.deleteTokenAndUnsubscribe.mockClear();
    actions.getAllTokens.mockClear();
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(TokensPage, {
        ...options,
        stubs: generateStubs(TokensPage),
      });
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
        wrapper.setComputed({
          isLoading: true,
        });

        expect(wrapper.find('v-spinner').exists()).toBe(true);
      });

      it('should not render v-spinner', () => {
        wrapper.setComputed({
          isLoading: false,
        });

        expect(wrapper.find('v-spinner').exists()).toBe(false);
      });
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallow(TokensPage, options);
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
        wrapper.setComputed({
          allCurrentAccountFullTokens: {},
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
        wrapper.setComputed({
          allCurrentAccountFullTokens: {},
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(2);

        wrapper.setData({
          networkTokenQuery: 'first',
        });

        expect(wrapper.vm.filteredTokens).toHaveLength(1);
        expect(wrapper.vm.filteredTokens[0]).toEqual(tokens[0]);
      });

      it('should contains empty array if current net is not main', () => {
        wrapper.setComputed({
          activeNetId: 3,
        });

        expect(wrapper.vm.filteredTokens).toEqual([]);
      });
    });
  });
});
