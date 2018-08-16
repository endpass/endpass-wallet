import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Web3 from 'web3';
import testAction from '../ActionTestingHelper';
import tokens from '@/store/tokens/tokens';
import { tokenInfoService } from '@/services';
import localStorageMock from '../../localStorageMock';

global.localStorage = localStorageMock;

jest.mock('eth-token-tracker');
jest.mock('@/services/ethplorer', () =>
  require('../../__mocks__/services/ethplorer'),
);
jest.mock('@/services/user', () => require('../../__mocks__/services/user'));

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send;

const commitFactory = state => (type, payload) =>
  tokens.mutations[type](state, payload);

const { actions, mutations } = tokens;

describe('tokens', () => {
  let commit;
  let dispatch;
  let stateInstance;
  let getters;
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    commit = jest.fn();
    dispatch = jest.fn();
    stateInstance = tokens.state();
    getters = { net: 1 };
  });

  afterEach(() => {
    mock.reset();
    commit.mockClear();
    dispatch.mockClear();
  });

  it('should get tokens from storage', async () => {
    await tokens.actions.init({ commit: commitFactory(stateInstance) });
    expect(stateInstance.savedTokens['3'].length).toBe(1);
    expect(stateInstance.savedTokens['3'][0].address).toBe(
      '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    );
  });

  it('should get tokens from service', async () => {
    tokenInfoService.getTokensList = jest.fn(() => Promise.resolve());

    await actions.getAllTokens({ dispatch, getters });

    expect(tokenInfoService.getTokensList).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array if an error occurs', async () => {
    tokenInfoService.getTokensList = jest.fn(() => Promise.reject());

    const result = await actions.getAllTokens({ dispatch, getters });

    expect(result).toEqual([]);
  });

  it('should return an empty array if not the main net', async () => {
    getters = { net: 2 };

    const result = await actions.getAllTokens({ dispatch, getters });

    expect(result).toEqual([]);
  });

  it('saves token to watch storage', () => {
    expect(stateInstance.savedTokens['3']).toBeFalsy();

    tokens.mutations.addToken(stateInstance, {
      token: { address: '0x4ce2109f8db1190cd44bc6554e35642214fbe144' },
      net: 3,
    });
    expect(stateInstance.savedTokens['3'].length).toBe(1);
  });

  it('saves Tokens', () => {
    tokens.mutations.saveActiveTokens(stateInstance, [1, 2, 3]);
    expect(stateInstance.activeTokens.length).toBe(3);
  });

  it('saves Interval', () => {
    tokens.mutations.saveInterval(stateInstance, 1);
    expect(stateInstance.tokensSerializeInterval).toBe(1);
  });

  it('saves Subscription', () => {
    tokens.mutations.saveSubscription(stateInstance, 1);
    expect(stateInstance.tokensSubscription).toBe(1);
  });

  it('adds Token To Subscription', done => {
    testAction(
      tokens.actions.addTokenToSubscription,
      { address: '0x0' },
      {
        rootState: {
          accounts: {
            address: {
              getChecksumAddressString() {
                return '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b';
              },
            },
          },
          web3: {
            activeNet: {
              id: 3,
            },
          },
        },
        state: {
          savedTokens: stateInstance.savedTokens,
          tokensSubscription: {
            count: 0,
            tokens: [],
            add() {
              this.count + 1;
            },
          },
        },
      },
      [{ type: 'addToken' }],
      [],
      done,
    );
  });

  it('gets non zero tokens', done => {
    mock.onGet(/api\.ethplorer\.io\/getAddressInfo/).reply(200, [
      {
        id: '1',
        to: '0x0',
      },
    ]);
    testAction(
      tokens.actions.getNonZeroTokens,
      null,
      {
        rootState: {
          accounts: {
            address: {
              getChecksumAddressString() {
                return '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b';
              },
            },
          },
        },
      },
      [],
      [
        {
          type: 'connectionStatus/updateApiErrorStatus',
        },
      ],
      done,
    );
  });

  it('creates Token Subscription', done => {
    const Timeout = setTimeout(function() {}, 0).constructor;
    testAction(
      tokens.actions.createTokenSubscription,
      [],
      {
        rootState: {
          accounts: {
            address: {
              getChecksumAddressString() {
                return '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b';
              },
            },
          },
          web3: {
            web3: new Web3('https://mainnet.infura.io/'),
          },
        },
        state: {
          savedTokens: stateInstance.savedTokens,
          activeTokens: stateInstance.activeTokens,
          tokensSubscription: {
            count: 0,
            add() {
              this.count + 1;
            },
          },
        },
        getters: {
          savedActiveTokens: [
            {
              address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
              decimals: 18,
              logo: '/img/0xe41d2489571d322189246dafa5ebde1f4699f498.png',
              manuallyAdded: true,
              name: '0x Project',
              symbol: 'ZRX',
            },
          ],
        },
      },
      [
        { type: 'saveActiveTokens' },
        { type: 'saveInterval' },
        { type: 'saveSubscription' },
      ],
      [],
      done,
    );
  });

  describe('remove', () => {
    let state;
    let getters;
    let token;

    beforeEach(() => {
      const tokensForSubscription = [
        { address: 'address1' },
        { address: 'address2' },
      ];
      state = {
        ...stateInstance,
        tokensSubscription: {
          tokens: [...tokensForSubscription],
        },
        savedTokens: {
          '3': [...tokensForSubscription],
        },
        activeTokens: [...tokensForSubscription],
      };
      getters = { net: 3 };
      token = { address: 'address2' };
    });

    it('should remove token from subscription', () => {
      mutations.removeToken(state, { token, net: 3 });
      mutations.removeToken(state, { token, net: 3 });

      const { activeTokens, savedTokens, tokensSubscription } = state;

      expect(tokensSubscription.tokens).toHaveLength(1);
      expect(savedTokens['3']).toHaveLength(1);
      expect(activeTokens).toHaveLength(1);
    });

    it('should call remove mutation', async () => {
      await actions.removeTokenFromSubscription(
        { commit, state, getters },
        token,
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(
        'removeToken',
        expect.objectContaining({
          token,
          net: 3,
        }),
      );
    });
  });
});
