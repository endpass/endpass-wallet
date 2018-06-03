import state from '@/store/accounts/accounts'

describe('accounts store', () => {
  it('should set wallet value', () => {
    state.mutations.setActiveAccount(state.state,1);
    expect(state.state.activeAccount).toBe(1);
  })
})

describe('accounts store', () => {
  it('should add a new account and set it active', () => {
    state.mutations.addAccount(state.state,2);
    state.mutations.setActiveAccount(state.state, 2)
    expect(state.state.accounts.length).toBe(1);
    expect(state.state.accounts[0]).toBe(2);
    expect(state.state.activeAccount).toBe(2);
  })
})
