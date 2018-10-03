import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import TokensList from '@/components/TokensList';
import { generateStubs } from '@/utils/testUtils';
import { tokens } from 'fixtures/tokens';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TokensList', () => {
  let actions;
  let wrapper;
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

    wrapper = shallow(TokensList, {
      store,
      localVue,
      stubs: generateStubs(TokensList),
      propsData: {
        tokens,
      },
    });
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
      expect(actions.getTokensPrices).toHaveBeenCalledTimes(1);
    });

    it('correctly calculates token fiat price', () => {
      expect(wrapper.vm.getTokenPrice('FST')).toBe('2');
      expect(wrapper.vm.getTokenPrice('BADSYMBOL')).toBe('0');
    });

    it('should call remove action', () => {
      wrapper.setProps({
        hasRemove: true,
      });
      wrapper.find('.remove-token-button').trigger('click');

      expect(actions.removeUserToken).toHaveBeenCalledTimes(1);
      expect(actions.removeUserToken).toBeCalledWith(
        expect.any(Object),
        {
          token: tokens[0],
        },
        undefined,
      );
    });
  });
});
