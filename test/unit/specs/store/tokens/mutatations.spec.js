import mutations from '@/store/tokens/mutations';
import {
  SAVE_TOKEN,
  DELETE_TOKEN,
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
  SAVE_TOKEN_PRICE,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_TRACKER_INSTANCE,
  SAVE_SERIALISATION_INTERVAL,
} from '@/store/tokens/mutations-types';
import { Token } from '@/class';

describe('tokens mutations', () => {
  it('saves token', () => {
    const token = {
      address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      symbol: 'ZERO',
      balance: 1,
      decimals: 1,
      logo: 'kek.jpg',
      name: 'Zero token',
    };
    const net = 1;
    let state = {
      savedTokens: {},
    };

    mutations[SAVE_TOKEN](state, { token, net });

    expect(state.savedTokens[net][0]).toMatchObject(token);
  });
  it('deletes token', () => {
    const token = {
      address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      symbol: 'ZERO',
      balance: 1,
      decimals: 1,
      logo: 'kek.jpg',
      name: 'Zero token',
    };
    const net = 1;
    let tokenTracker = {
      tokens: [token],
    };
    let state = {
      savedTokens: {
        [net]: [token],
      },
      trackedTokens: [token],
      tokenTracker,
    };

    mutations[DELETE_TOKEN](state, { token, net });

    expect(state.savedTokens[net]).not.toContain(token);
    expect(state.tokenTracker.tokens).not.toContain(token);
    expect(state.trackedTokens).not.toContain(token);
  });

  it('saves tracked tokens as Token objects', () => {
    const tokens = [
      {
        address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
        symbol: 'ZERO',
        balance: 1,
        decimals: 1,
        logo: 'kek.jpg',
        name: 'Zero token',
      },
    ];
    let state = {};

    mutations[SAVE_TRACKED_TOKENS](state, tokens);

    expect(state.trackedTokens.length).toBe(1);
    expect(state.trackedTokens[0]).toMatchObject(tokens[0]);
    expect(state.trackedTokens[0] instanceof Token).toBe(true);
  });

  it('saves tokens prices', () => {
    const prices = [
      {
        price: '100',
      },
    ];
    let state = {};

    mutations[SAVE_TOKENS_PRICES](state, prices);

    expect(state.prices).toBe(prices);
  });

  it('saves token price', () => {
    const price = [
      {
        price: '100',
      },
    ];
    const symbol = 'kek';
    let state = {};

    mutations[SAVE_TOKEN_PRICE](state, { price, symbol });

    expect(state.prices[symbol]).toBe(price);
  });

  it('saves tracker instanse', () => {
    const tracker = [
      {
        price: '100',
      },
    ];
    let state = {};

    mutations[SAVE_TOKEN_TRACKER_INSTANCE](state, tracker);

    expect(state.tokenTracker).toBe(tracker);
  });

  it('saves serialisations interval', () => {
    const interval = [
      {
        price: '100',
      },
    ];
    let state = {};

    mutations[SAVE_SERIALISATION_INTERVAL](state, interval);

    expect(state.tokensSerializeInterval).toBe(interval);
  });
});
