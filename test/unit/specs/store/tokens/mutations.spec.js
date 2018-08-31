import mutations from '@/store/tokens/mutations';
import {
  SAVE_TOKEN,
  DELETE_TOKEN,
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
  SAVE_TOKEN_PRICE,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_INFO,
} from '@/store/tokens/mutations-types';
import { Token } from '@/class';
import tokensFixture from 'fixtures/tokens';

describe('tokens mutations', () => {
  it('saves token', () => {
    const token = {
      address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      symbol: 'ZERO',
      decimals: 1,
      logo: 'kek.jpg',
      name: 'Zero token',
    };
    const net = 1;
    let state = {
      savedTokens: {},
      tokenTracker: {
        add: jest.fn(),
      },
    };

    mutations[SAVE_TOKEN](state, { token, net });
    expect(state.tokenTracker.add).toHaveBeenCalledWith({ ...token });
    expect(state.savedTokens[net][0]).toMatchObject(token);
  });
  it('deletes token', () => {
    const token = {
      address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      symbol: 'ZERO',
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
        decimals: 1,
        logo: 'kek.jpg',
        name: 'Zero token',
      },
    ];
    let token = tokens[0];
    let state = {
      allTokens: {
        [token.address]: token,
      },
    };

    mutations[SAVE_TRACKED_TOKENS](state, tokens);

    expect(state.trackedTokens.length).toBe(1);
    expect(state.trackedTokens[0]).toMatchObject(tokens[0]);
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

  it('saves and freezes token info', () => {
    let state = {};
    const allTokens = tokensFixture.tokens;
    mutations[SAVE_TOKEN_INFO](state, allTokens);

    let token = allTokens[0];

    expect(Object.keys(state.allTokens)).toHaveLength(2);
    expect(state.allTokens[token.address]).toBeInstanceOf(Token);

    expect(Object.isFrozen(state.allTokens)).toBe(true);
    expect(Object.isFrozen(state.allTokens[token.address])).toBe(true);
  });
});
