import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import TokenList from '@/components/TokenList';
import { Token } from '@/class/Token';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TokenList', () => {
  let tokens;
  let actions;
  let getters;
  let wrapper;
  let store;

  beforeEach(() => {
    tokens = [
      {
        name: 'First Token',
        symbol: 'FST',
        address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      },
      {
        name: 'second token',
        symbol: '$SCdT',
        address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
      },
    ];

    actions = {
      updateTokenPrice: jest.fn(),
    };

    getters = {
      tokenEthPrice: jest.fn(() => 1),
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
            prices: {},
          },
          actions,
          getters,
        },
        price: {
          namespaced: true,
          state: {
            price: 0,
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

    wrapper = shallow(TokenList, {
      store,
      localVue,
    });
  });

  it('fetches token prices on mount', async () => {
    expect(wrapper.vm.tokens.length).toBe(2);
    await flushPromises();
    expect(actions.updateTokenPrice).toHaveBeenCalledTimes(2);
  });
});
