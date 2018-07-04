import Vue from 'vue'
import testAction from '../ActionTestingHelper'
import tokens from '@/store/tokens/tokens'
import moxios from 'moxios'
import Web3 from 'web3'

jest.mock('eth-token-tracker');
jest.mock('@/services/ethplorer');
jest.mock('@/services/user');

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send;

localStorage.setItem(
  'tokens',
  JSON.stringify([
    {
      address: '0x0',
    },
  ])
);

const commit = state => (type, payload) =>
  tokens.mutations[type](state, payload);

let stateInstance = tokens.state();

describe('tokens', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  it('it should get tokens from storage', async () => {
    await tokens.actions.init({ commit: commit(stateInstance) });
    expect(stateInstance.savedTokens['3'].length).toBe(1);
    expect(stateInstance.savedTokens['3'][0].address).toBe(
      '0xE41d2489571d322189246DaFA5ebDe1F4699F498'
    );
  });
  it('saves token to watch storage', () => {
    tokens.mutations.addToken(stateInstance, {
      token: { address: '0x2' },
      net: 3,
    });
    expect(stateInstance.savedTokens['3'].length).toBe(2);
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
  it('adds Token To Subscription', (done) => {
    testAction(
      tokens.actions.addTokenToSubscription,
      { address: '0x0' },
      {
        rootState: {
          accounts: {
            address: {
              getAddressString() {
                return '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b';
              },
            },
          },
          web3: {
            activeNet: {
              id: 3,
            }
          }
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
      done
    );
  });
  it('gets non zero tokens', done => {
    moxios.stubRequest(/api\.ethplorer\.io\/getAddressInfo/, {
      status: 200,
      response: [
        {
          id: '1',
          to: '0x0',
        },
      ],
    });
    testAction(
      tokens.actions.getNonZeroTokens,
      null,
      {
        rootState: {
          accounts: {
            address: {
              getAddressString() {
                return '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b';
              },
            },
          },
        },
      },
      [],
      [{
        type: 'connectionStatus/updateApiErrorStatus'
      }],
      done
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
              getAddressString() {
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
        }
      },
      [{ type: 'saveInterval' }, { type: 'saveSubscription' }],
      [],
      done
    );
  });
});
