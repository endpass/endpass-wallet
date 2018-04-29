import state from '../../../src/store/accounts/accounts'

describe('accounts store', () => {
  it('should set wallet value', () => {
    state.mutations.addAccount(state.state,1);
    expect(state.state.activeAccount).toBe(1);
  })
})

describe('accounts store', () => {
  it('should not change existing account value', () => {
    state.mutations.addAccount(state.state,2);
    expect(state.state.activeAccount).toBe(1);
  })
})
