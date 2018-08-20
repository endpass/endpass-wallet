import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import validation from '@/validation';
import tokensFixture from 'fixtures/tokens';

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
  let tokens;

  beforeEach(() => {
    tokens = tokensFixture.tokens;

    actions = {
      updateTokenPrice: jest.fn(),
      saveTokenAndSubscribe: jest.fn(),
      deleteTokenAndUnsubscribe: jest.fn(),
      getAllTokens: jest.fn(() => tokens),
    };

    getters = {
      savedCurrentNetworkTokens: () => [{}],
      net: () => 1,
    };

    store = new Vuex.Store({
      modules: {
        accounts: {
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
            trackedTokens: tokens,
            prices: null,
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
      expect(wrapper.name()).toBe('tokens-page');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('v-spinner', () => {
      // it('should render v-spinner', () => {
      //   wrapper.setComputed({
      //     trackedTokens: [],
      //   });
      //
      //   expect(wrapper.find('v-spinner').attributes()).toEqual({
      //     'is-loading': 'true',
      //     class: 'spinner-block',
      //   });
      // });

      it('should not render v-spinner', () => {
        wrapper.setComputed({
          trackedTokens: [{}, {}],
        });

        expect(wrapper.find('v-spinner').attributes()).toEqual({
          class: 'spinner-block',
        });
      });
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallow(TokensPage, options);
    });

    describe('search', () => {
      it("should correctly find the user's tokens", () => {
        expect(wrapper.vm.userTokenList).toHaveLength(2);

        wrapper.setData({
          search: 'fst',
        });

        expect(wrapper.vm.userTokenList).toHaveLength(1);
      });

      it('should correctly find tokens in list', async () => {
        expect(wrapper.vm.searchTokenList).toHaveLength(0);

        wrapper.setData({
          tokens: [
            ...tokens,
            {
              name: 'Third Token',
              symbol: 'TTKN',
              address: '0x687422eEA2cB73B5d3e242bA5456b782919AFc85',
            },
            {
              name: 'fours token',
              symbol: 'FurT',
              address: '0xAb54DE61A908583e6332a1282c7bFcA39f899B4f',
            },
          ],
        });

        expect(wrapper.vm.$data.tokens).toHaveLength(4);

        wrapper.setData({
          searchToken: 'ttk',
        });

        expect(wrapper.vm.searchTokenList).toHaveLength(1);

        wrapper.setData({
          searchToken: '',
        });

        expect(wrapper.vm.searchTokenList).toHaveLength(2);

        wrapper.setData({
          searchToken: 'hir',
        });

        expect(wrapper.vm.searchTokenList).toHaveLength(1);
      });
    });
  });

  describe('props', () => {
    beforeEach(() => {
      wrapper = shallow(TokensPage, options);
    });

    it('should call an action when changing the net id', () => {
      expect(wrapper.vm.userTokenList).toHaveLength(2);

      wrapper.setComputed({
        net: 3,
      });

      expect(actions.getAllTokens).toHaveBeenCalledTimes(2);
    });
  });
});
