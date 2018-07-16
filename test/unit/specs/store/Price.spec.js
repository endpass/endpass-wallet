import state from '@/store/price/price';
import moxios from 'moxios';
import testAction from '../ActionTestingHelper';

const commit = state => (type, payload) =>
  state.mutations[type](state, payload);

const dispatch = context => type => {
  state.actions[type](context);
};

describe('price store', async () => {
  let stateInstance;
  beforeEach(async () => {
    moxios.install();
    stateInstance = state.state;
    await state.actions.init({
      commit: commit(stateInstance),
      dispatch: dispatch({ state: stateInstance, commit, dispatch }),
      state: stateInstance,
    });
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('should set price', async () => {
    state.mutations.setPrice(stateInstance, 10);
    expect(stateInstance.price).toBe(10);
  });

  it('should set date', async () => {
    state.mutations.setUpdateTime(stateInstance, 10);
    expect(stateInstance.updateTime).toBe(10);
  });

  it('should update price', done => {
    moxios.stubRequest(/min-api\.cryptocompare\.com\/data\/price/, {
      status: 200,
      response: [
        {
          USD: 200,
        },
      ],
    });
    testAction(
      state.actions.updatePrice,
      null,
      {
        rootState: {
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
