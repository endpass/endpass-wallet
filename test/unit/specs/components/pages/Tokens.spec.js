import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import validation from '@/validation';

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
    tokens = [
      {
        name: 'First Token',
        symbol: 'FST',
        address: '0x4ce2109f8db1190cd44bc6554e35642214fbe144',
      },
      {
        name: 'second token',
        symbol: '$SCdT',
        address: '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b',
      },
    ];

    actions = {
      updateTokenPrice: jest.fn(),
      addTokenToSubscription: jest.fn(),
      removeTokenFromSubscription: jest.fn(),
      getAllTokens: jest.fn(() => tokens),
    };

    getters = {
      savedActiveTokens: () => [{}],
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
            activeTokens: tokens,
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
    actions.addTokenToSubscription.mockClear();
    actions.removeTokenFromSubscription.mockClear();
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
      //     activeTokens: [],
      //   });
      //
      //   expect(wrapper.find('v-spinner').attributes()).toEqual({
      //     'is-loading': 'true',
      //     class: 'spinner-block',
      //   });
      // });

      it('should not render v-spinner', () => {
        wrapper.setComputed({
          activeTokens: [{}, {}],
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
        expect(wrapper.vm.searchTokenList).toHaveLength(2);

        wrapper.setData({
          tokens: [
            ...tokens,
            {
              name: 'Third Token',
              symbol: 'TTKN',
              address: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
            },
            {
              name: 'fours token',
              symbol: 'FurT',
              address: '0xab54de61a908583e6332a1282c7bfca39f899b4f',
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

        expect(wrapper.vm.searchTokenList).toHaveLength(4);

        wrapper.setData({
          searchToken: 'hir',
        });

        expect(wrapper.vm.searchTokenList).toHaveLength(1);
      });
    });

    describe('user token', () => {
      it('should call remove action', () => {
        const button = wrapper.find('span#remove-token-1');
        button.trigger('click');

        expect(actions.removeTokenFromSubscription).toHaveBeenCalledTimes(1);
        expect(actions.removeTokenFromSubscription).toBeCalledWith(
          expect.any(Object),
          tokens[1],
          undefined,
        );
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
