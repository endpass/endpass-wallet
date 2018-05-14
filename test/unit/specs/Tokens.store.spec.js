import Vue from 'vue'
import tokens from '../../../src/store/tokens/tokens'

localStorage.setItem('tokens', JSON.stringify([{
      address: '0x0'
}]));

let stateInstance = tokens.state();

describe('tokens', () => {
  it('it should get tokens from localStorage', () => {
    expect(stateInstance.savedTokens.length).toBe(1);
    expect(stateInstance.savedTokens[0].address).toBe('0x0');
  })
  it('correctly gets tokens to watch', () => {
    stateInstance.activeTokens = [{
      address: '0x1'
    }];
    expect(tokens.getters.tokensToWatch(stateInstance).length).toBe(2);
  })
  it ('saves token to watch storage', () => {
    tokens.mutations.saveTokenToWatchStorage(stateInstance, { address : '0x2'})
    expect(stateInstance.savedTokens.length).toBe(2);
    expect(JSON.parse(localStorage.getItem('tokens')).length).toBe(2);
  })
  it ('saves Tokens' () => {
    tokens.mutations.saveTokens(stateInstance, [1,2,3]);
    expect(stateInstance.activeTokens.length).toBe(3);
  })
  it ('saves Interval' , () => {
    tokens.mutations.saveInterval(stateInstance, 1);
    expect(stateInstance.interval).toBe(1);
  });
  it ('saves Subscription' , () => {
    tokens.mutations.saveSubscription(stateInstance, 1);
    expect(stateInstance.subscription).toBe(1);
  });
})
