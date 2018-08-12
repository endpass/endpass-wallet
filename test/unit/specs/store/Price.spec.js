import state from '@/store/price/price';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import testAction from '../ActionTestingHelper';

const commit = state => (type, payload) =>
  state.mutations[type](state, payload);

const dispatch = context => type => {
  state.actions[type](context);
};

describe('price store', async () => {
  let stateInstance;
  let mock;
  beforeEach(async () => {
    mock = new MockAdapter(axios);
    stateInstance = state.state;
    await state.actions.init({
      commit: commit(stateInstance),
      dispatch: dispatch({ state: stateInstance, commit, dispatch }),
      state: stateInstance,
    });
  });
  afterEach(() => {
    mock.reset();
  });
  it('should set price', async () => {
    state.mutations.setPrice(stateInstance, 10);
    await flushPromises();
    expect(stateInstance.price).toBe(10);
  });

  it('should set date', async () => {
    state.mutations.setUpdateTime(stateInstance, 10);
    await flushPromises();
    expect(stateInstance.updateTime).toBe(10);
  });

  it('should update price', done => {
    mock.onGet(/min-api\.cryptocompare\.com\/data\/price/).reply(200, {
      USD: 200,
    });
    testAction(
      state.actions.updatePrice,
      null,
      {
        rootState: {
          web3: {
            activeCurrency: {
              name: 'ETH',
            },
          },
          accounts: {
            settings: {
              fiatCurrency: 'USD',
            },
          },
        },
      },
      [
        {
          type: 'setPrice',
        },
        {
          type: 'setUpdateTime',
        },
      ],
      [
        {
          type: 'connectionStatus/updateApiErrorStatus',
        },
      ],
      done,
    );
  });
});
