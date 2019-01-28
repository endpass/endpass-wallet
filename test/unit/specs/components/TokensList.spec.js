import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { wrapShallowMountFactory } from '@/testUtils';

import TokensList from '@/components/TokensList';

import { tokens, fullTokensMappedByAddresses } from 'fixtures/tokens';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TokensList', () => {
  let actions;
  let wrapper;
  let wrapperFactory;
  let store;

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
            currentNetUserFullTokens: () => fullTokensMappedByAddresses,
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

    wrapperFactory = wrapShallowMountFactory(TokensList, {
      store,
      localVue,
      propsData: {
        tokens,
      },
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should render given tokens list', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should not show remove token button by default', () => {
      expect(wrapper.find('.remove-token-button').exists()).toBeFalsy();
    });
  });

  describe('behavior', () => {
    it('fetches token prices on mount', async () => {
      expect.assertions(1);

      expect(actions.getTokensPrices).toHaveBeenCalledTimes(1);
    });

    it('correctly calculates token fiat price', () => {
      expect(wrapper.vm.getTokenPrice('FST')).toBe('2');
      expect(wrapper.vm.getTokenPrice('BADSYMBOL')).toBe('0');
    });

    it('should render remove button only for user tokens with non zero balance', async () => {
      expect.assertions(3);

      wrapper = wrapperFactory({
        propsData: {
          tokens,
        },
        computed: {
          currentNetUserFullTokens: fullTokensMappedByAddresses,
        },
      });

      wrapper.setProps({
        hasRemove: true,
        tokens: Object.values(fullTokensMappedByAddresses),
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('.remove-token-button')).toHaveLength(1);

      wrapper.find('.remove-token-button').trigger('click');

      expect(actions.removeUserToken).toHaveBeenCalledTimes(1);
      expect(actions.removeUserToken).toBeCalledWith(
        expect.any(Object),
        {
          token: Object.values(fullTokensMappedByAddresses)[0],
        },
        undefined,
      );
    });
  });
});
