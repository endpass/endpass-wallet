import Vue from 'vue'
import tokens from '../../../src/store/tokens/tokens'

localStorage.setItem('tokens', JSON.stringify([{
      address: '0x0'
}]));

let stateInstance = tokens.state();

const testAction = (action, payload, state, expectedMutations, done) => {
  let count = 0

  // mock commit
  const commit = (type, payload) => {
    const mutation = expectedMutations[count]

    try {
      expect(type).to.equal(mutation.type)
      if (payload) {
        expect(payload).to.deep.equal(mutation.payload)
      }
    } catch (error) {
      done(error)
    }

    count++
    if (count >= expectedMutations.length) {
      done()
    }
  }

  // call the action with mocked store and arguments
  action({ commit, state }, payload)

  // check if no mutations should have been dispatched
  if (expectedMutations.length === 0) {
    expect(count).to.equal(0)
    done()
  }
}

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
  it ('saves Tokens', () => {
    tokens.mutations.saveTokens(stateInstance, [1,2,3]);
    expect(stateInstance.activeTokens.length).toBe(3);
  })
  it ('saves Interval' , () => {
    tokens.mutations.saveInterval(stateInstance, 1);
    expect(stateInstance.tokensSubscription).toBe(1);
  });
  it ('saves Subscription' , () => {
    tokens.mutations.saveSubscription(stateInstance, 1);
    expect(stateInstance.tokensSerializeInterval).toBe(1);
  });
  // it('createTokenSubscribtion', done => {
  //   testAction(tokens.actions.createTokenSubscribtion, null, stateInstance, [
  //     { type: 'saveInterval' },
  //     { type: 'saveSubscription' }
  //   ], done)
  // })
})
