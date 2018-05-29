import Vue from 'vue'
import testAction from './ActionTestingHelper'
import tokens from '@/store/tokens/tokens'
import moxios from 'moxios'
import Web3 from 'web3'

jest.mock('eth-token-tracker')
jest.mock('@/services/ethplorer')

Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;


localStorage.setItem('tokens', JSON.stringify([{
      address: '0x0'
}]));

let stateInstance = tokens.state();

describe('tokens', () => {

  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('it should get tokens from localStorage', () => {
    expect(stateInstance.savedTokens.length).toBe(1);
    expect(stateInstance.savedTokens[0].address).toBe('0x0');
  })
  it ('saves token to watch storage', () => {
    tokens.mutations.saveTokenToWatchStorage(stateInstance, { address : '0x2'})
    expect(stateInstance.savedTokens.length).toBe(2);
    expect(JSON.parse(localStorage.getItem('tokens')).length).toBe(2);
  })
  it ('saves Tokens', () => {
    tokens.mutations.saveTokens(stateInstance, [1,2,3]);
    expect(stateInstance.activeTokens.length).toBe(3);
  })
  it ('saves Interval' , () => {
    tokens.mutations.saveInterval(stateInstance, 1);
    expect(stateInstance.tokensSerializeInterval).toBe(1);
  });
  it ('saves Subscription' , () => {
    tokens.mutations.saveSubscription(stateInstance, 1);
    expect(stateInstance.tokensSubscription).toBe(1);
  });
  it('adds Token To Subscribtion', (done) => {
    testAction(tokens.actions.addTokenToSubscribtion, {address : '0x0'}, {
      rootState: {
        accounts: {
          activeAccount : {
            getAddressString() {
              return '0x0'
            }
          }
        }
      },
      state : {
        savedTokens : stateInstance.savedTokens,
        tokensSubscription: {
          count: 0,
          tokens: [],
          add () {
            this.count +1;
          }
        }
      }
    }, [
      { type: 'saveTokenToWatchStorage' }
    ],[],  done);
  })
  it('gets non zero tokens', (done) => {
    moxios.stubRequest(/api\.ethplorer\.io\/getAddressInfo/, {
      status: 200,
      response: [{
        id: '1',
        to: '0x0'
      }]
    })
    testAction(tokens.actions.getNonZeroTokens, null, {
      rootState: {
        accounts: {
          activeAccount : {
            getAddressString() {
              return '0x0'
            }
          }
        }
      }
    }, [
    ],[], done);
  })
  it('creates Token Subscribtion', (done) => {
    const Timeout = setTimeout(function(){}, 0).constructor;
    testAction(tokens.actions.createTokenSubscribtion, [], {
      rootState: {
        accounts: {
          activeAccount : {
            getAddressString() {
              return '0x0'
            }
          }
        },
        web3: {
          web3: new Web3 ('https://mainnet.infura.io/')
        }
      },
      state : {
        savedTokens : stateInstance.savedTokens,
        activeTokens : stateInstance.activeTokens,
        tokensSubscription: {
          count: 0,
          add () {
            this.count +1;
          }
        }
      }
    }, [
      { type: 'saveInterval' },
      { type: 'saveSubscription' }
    ],[], done);
  })
})
