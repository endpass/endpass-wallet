import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { wrapShallowMountFactory, wrapMountFactory } from '@/testUtils';

import TokensList from '@/components/TokensList';

import {
  zeroBalancedTokens,
  dustAmountTokens,
  valuableTokens,
  tokensWithBalancesMappedByAddresses,
} from 'fixtures/tokens';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TokensList', () => {
  let actions;
  let wrapper;
  let wrapperFactory;
  let store;
  let options;

  beforeEach(() => {
    actions = {
      getTokensPrices: jest.fn(),
      removeUserToken: jest.fn(),
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
            prices: {
              FST: { ETH: 2 }, // price of token in ETH
            },
          },
          getters: {
            currentNetUserFullTokens: () => tokensWithBalancesMappedByAddresses,
          },
          actions,
        },
        price: {
          namespaced: true,
          state: {
            price: 1, // Ethereum price
          },
        },
        errors: {
          namespaced: true,
          actions: {
            emitError(state, e) {
              throw e;
            },
          },
        },
      },
    });

    options = {
      store,
      localVue,
      propsData: {
        tokens: valuableTokens,
      },
    };
    wrapperFactory = wrapShallowMountFactory(TokensList, options);
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should render given tokens list', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should not show remove token button by default', () => {
      expect(wrapper.find('.remove-token-button').exists()).toBeFalsy();
    });

    it('should not render dust amount tokens by default', () => {
      wrapper = wrapperFactory({
        store,
        localVue,
        propsData: {
          tokens: dustAmountTokens,
        },
      });

      expect(wrapper.find('[data-test=dustbin-toggler]').exists()).toBe(true);
      expect(wrapper.find('[data-test=user-token]').exists()).toBe(false);
    });

    it('should render dust amount tokens if toggler is enabled', () => {
      wrapper = wrapperFactory({
        store,
        localVue,
        propsData: {
          tokens: dustAmountTokens,
        },
      });

      expect(wrapper.find('[data-test=user-token]').exists()).toBe(false);

      wrapper.setData({
        isDustbinTokensVisible: true,
      });

      expect(wrapper.find('[data-test=user-token]').exists()).toBe(true);
    });

    it('should render valuable tokens by default', () => {
      wrapper = wrapperFactory({
        store,
        localVue,
        propsData: {
          tokens: [...dustAmountTokens, ...valuableTokens],
        },
      });

      expect(wrapper.find('[data-test=user-token]').exists()).toBe(true);
    });

    it('should not render dustbin controls if collapsable is falsy', () => {
      wrapper = wrapperFactory({
        store,
        localVue,
        propsData: {
          tokens: dustAmountTokens,
          collapsable: false,
        },
      });

      expect(wrapper.find('[data-test=dustbin-toggler]').exists()).toBe(false);
      expect(wrapper.find('[data-test=dustbin-user-token]').exists()).toBe(
        false,
      );
      expect(wrapper.find('[data-test=user-token]').exists()).toBe(true);
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      options = {
        ...options,
        propsData: {
          hasRemove: true,
          tokens: zeroBalancedTokens,
        },
        computed: {
          currentNetUserFullTokens: tokensWithBalancesMappedByAddresses,
        },
      };
      wrapperFactory = wrapMountFactory(TokensList, options);
    });

    describe('remove token', () => {
      beforeEach(() => {
        wrapper = wrapperFactory({
          ...options,
          methods: {
            isTokenCanBeDeleted: jest.fn().mockImplementationOnce(() => true),
          },
        });
        wrapper.setData({
          isDustbinTokensVisible: true,
        });
      });

      it('should render remove button only for user tokens with zero balance', () => {
        expect(wrapper.find('[data-test=delete-button]').exists()).toBe(true);
      });

      it('should remove tokens on click remove button', () => {
        jest.spyOn(wrapper.vm, 'deleteToken');

        wrapper.find('[data-test=delete-button]').trigger('click');

        expect(wrapper.vm.deleteToken).toBeCalledTimes(1);
      });
    });

    describe('dustbin tokens tokens', () => {
      it('should show dustbin tokens on toggler check', () => {
        wrapper = wrapperFactory({
          store,
          localVue,
          propsData: {
            tokens: dustAmountTokens,
          },
        });
        wrapper.setData({
          isDustbinTokensVisible: false,
        });

        expect(wrapper.find('[data-test=user-token]').exists()).toBe(false);

        wrapper.find('[data-test=dustbin-toggler]').trigger('click');

        expect(wrapper.vm.isDustbinTokensVisible).toBe(true);
        expect(wrapper.find('[data-test=user-token]').exists()).toBe(true);
      });
    });
  });
});
