import { mount, createLocalVue } from '@vue/test-utils';
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

  let numTokens = tokensFixture.tokens.length;

  beforeEach(() => {
    actions = {
      updateTokenPrice: jest.fn(),
      deleteTokenAndUnsubscribe: jest.fn(),
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
            trackedTokens: tokensFixture.tokens,
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

    wrapper = mount(TokenList, {
      store,
      localVue,
    });
  });

  it('fetches token prices on mount', async () => {
    expect(wrapper.vm.selectedTokens.length).toBe(numTokens);
    await flushPromises();
    expect(actions.updateTokenPrice).toHaveBeenCalledTimes(numTokens);
  });

  it('correctly calculates token fiat price', () => {
    expect(wrapper.vm.getTokenPrice('FST')).toBe('2');
    expect(wrapper.vm.getTokenPrice('BADSYMBOL')).toBe('0');
  });

  it('maps token prices', () => {
    let priceMap = wrapper.vm.prices;
    expect(priceMap.size).toBe(numTokens);
    expect(priceMap).toBeInstanceOf(Map);
    expect(priceMap.get('FST')).toBe('2');
  });

  it('allows setting custom token list', () => {
    wrapper.setProps({ tokens: tokensFixture.tokens.slice(0, 1) });
    expect(wrapper.vm.selectedTokens).toHaveLength(1);
    expect(wrapper.vm.selectedTokens[0]).toBeInstanceOf(Token);
  });

  it('should not show remove token button by default', () => {
    expect(wrapper.find('.remove-token-button').exists()).toBeFalsy();
  });

  it('should call remove action', () => {
    wrapper.setProps({ hasRemove: true });
    wrapper.find('.remove-token-button').trigger('click');

    expect(actions.deleteTokenAndUnsubscribe).toHaveBeenCalledTimes(1);
    expect(actions.deleteTokenAndUnsubscribe).toBeCalledWith(
      expect.any(Object),
      wrapper.vm.selectedTokens[0],
      undefined,
    );
  });
});
