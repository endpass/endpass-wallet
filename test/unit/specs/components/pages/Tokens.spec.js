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
      getAllTokens: jest.fn(() => tokensFixture.allTokens),
    };

    getters = {
      savedCurrentNetworkTokens: () => [{}],
      trackedTokens: state => state.trackedTokens || [],
      net: () => 1,
      tokensWithBalance: state =>
        state.trackedTokens.map(address => state.allTokens[address]),
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
            trackedTokens: tokens.map(token => token.address),
            prices: null,
            allTokens: tokensFixture.allTokens,
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

        expect(wrapper.find('v-spinner').attributes()).toEqual({
          'is-loading': 'true',
          class: 'spinner-block',
        });
      });

      it('should not render v-spinner', () => {
        wrapper.setComputed({
          isLoading: false,
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

      it('should correctly find token in list', async () => {
        store.state.tokens.trackedTokens = [];
        expect(wrapper.vm.filteredTokens).toHaveLength(2);
        expect(wrapper.vm.searchTokenList).toHaveLength(2);
        wrapper.setData({ searchToken: '' });
        expect(wrapper.vm.searchTokenList).toHaveLength(2);

        wrapper.setData({
          searchToken: 'FST',
        });

        expect(wrapper.vm.searchTokenList).toHaveLength(1);
        expect(wrapper.vm.searchTokenList[0]).toEqual(tokens[0]);

        wrapper.setData({
          searchToken: '',
        });

        expect(wrapper.vm.searchTokenList).toHaveLength(2);

        wrapper.setData({
          searchToken: 'second',
        });

        expect(wrapper.vm.searchTokenList).toHaveLength(1);
        expect(wrapper.vm.searchTokenList[0]).toEqual(tokens[1]);
      });
      it('should filter out tracked tokens', async () => {
        store.state.tokens.trackedTokens = [
          '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
        ];
        expect(wrapper.vm.filteredTokens).toHaveLength(1);
        expect(wrapper.vm.filteredTokens[0]).toEqual(tokens[0]);

        wrapper.setData({
          searchToken: 'n',
        });
        expect(wrapper.vm.searchTokenList).toHaveLength(1);
        expect(wrapper.vm.searchTokenList[0]).toEqual(tokens[0]);
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

      expect(actions.getAllTokens).toHaveBeenCalledTimes(0);
    });
  });
});
