import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import TokenList from '@/components/TokenList';
import { Token } from '@/class/Token';
import tokensFixture from 'fixtures/tokens';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TokenList', () => {
  let actions;
  let getters;
  let wrapper;
  let store;

  beforeEach(() => {
    actions = {
      updateTokenPrice: jest.fn(),
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
            activeTokens: tokensFixture.tokens,
            prices: {
              FST: 2, // price of token in ETH
            },
          },
          actions,
        },
        price: {
          namespaced: true,
          state: {
            price: 1, //Ethereum price
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
    let numTokens = tokensFixture.tokens.length;
    expect(wrapper.vm.tokens.length).toBe(numTokens);
    await flushPromises();
    expect(actions.updateTokenPrice).toHaveBeenCalledTimes(numTokens);
  });

  it('correctly calculates token fiat price', () => {
    expect(wrapper.vm.getTokenPrice('FST')).toBe('2');
    expect(wrapper.vm.getTokenPrice('BADSYMBOL')).toBe('0');
  });
});
