import state from '@/store/transactions/transactions';
import testAction from '../ActionTestingHelper';

const commit = state => (type, payload) =>
  state.mutations[type](state, payload);

const dispatch = context => type => {
  state.actions[type](context);
};

describe('transactions store', async () => {
  let stateInstance;
  beforeEach(async () => {
    stateInstance = {
      pendingTransactions: [],
    };
  });
  it('should get account transactions correctly', () => {
    stateInstance.pendingTransactions = [
      {
        to: '0x0',
        state: 'success',
      },
      {
        from: '0x0',
      },
      {
        to: '0x1',
        from: '0x4ce2109f8db1190cd44bc6554e35642214fbe144',
      },
    ];
    let transactions = state.getters.accountTransactions(
      stateInstance,
      {},
      {
        accounts: {
          address: {
            getChecksumAddressString() {
              return '0x0';
            },
          },
        },
      },
    );
    expect(transactions.length).toBe(2);
    expect(transactions[0]).toBe(stateInstance.pendingTransactions[0]);
  });

  it('should return an empty array with a nullable address', () => {
    stateInstance.pendingTransactions = [
      {
        to: '0x0',
        state: 'success',
      },
    ];

    const transactions = state.getters.accountTransactions(
      stateInstance,
      {},
      {
        accounts: {
          address: null,
        },
      },
    );

    expect(transactions).toEqual([]);
  });

  it('should get pending balance correctly', () => {
    stateInstance.pendingTransactions = [
      {
        from: '0x0',
        token: 'ETH',
        networkId: 1,
        state: 'pending',
        valueWei: '1',
        gasCost: '6',
      },
      {
        from: '0x0',
        token: 'ETH',
        networkId: 1,
        state: 'success',
        valueWei: '1',
        gasCost: '6',
      },
      {
        from: '0x0',
        token: 'ETH',
        networkId: 2,
        state: 'success',
        valueWei: '2',
        gasCost: '5',
      },
      {
        to: '0x1',
        token: 'ETH',
        networkId: 1,
        state: 'success',
        valueWei: '3',
        gasCost: '4',
        from: '0x2',
      },
    ];

    let pendingBalance = state.getters.pendingBalance(
      stateInstance,
      {},
      {
        accounts: {
          address: {
            getChecksumAddressString() {
              return '0x0';
            },
          },
        },
        web3: {
          activeNet: {
            id: 1,
          },
        },
      },
    );
    expect(pendingBalance).toBe('7');
  });

  it('should return zero pending balance with a nullable address', () => {
    stateInstance.pendingTransactions = [
      {
        from: '0x0',
        token: 'ETH',
        networkId: 1,
        state: 'pending',
        valueWei: '1',
        gasCost: '6',
      },
    ];

    const pendingBalance = state.getters.pendingBalance(
      stateInstance,
      {},
      {
        accounts: {
          address: null,
        },
      },
    );
    expect(pendingBalance).toBe('0');
  });
});
