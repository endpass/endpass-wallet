import { shallow, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import ReceivePage from '@/components/pages/Receive.vue';
import web3 from 'web3';
import ethereumWalletMock from 'fixtures/wallet';
import { checksumAddress } from 'fixtures/accounts';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Notifications);
localVue.use(Vuex);

describe('ReceivePage', () => {
  const actions = {
    'connectionStatus/updateApiErrorStatus': jest.fn(),
    'errors/emitError': jest.fn(),
  };
  let store;
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(axios);

    store = new Vuex.Store({
      state: {
        web3: {
          web3,
          activeCurrency: {
            name: 'ETH',
          },
        },
      },
      actions,
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: wallet,
          },
          getters: {
            balance: jest.fn(),
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    axiosMock.reset();
  });

  it('downloads transaction history', async () => {
    expect.assertions(2);

    const wrapper = shallow(ReceivePage, {
      store,
      localVue,
    });

    wrapper.setComputed({
      address: checksumAddress,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.transactions).toHaveLength(1);
    expect(wrapper.vm.transactions[0].to).toBe(wrapper.vm.address);
  });
});
