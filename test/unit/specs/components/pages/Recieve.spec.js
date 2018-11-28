import { shallow, createLocalVue } from '@vue/test-utils';
import { set } from 'lodash';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import ReceivePage from '@/components/pages/Receive.vue';
import ethereumWalletMock from 'fixtures/wallet';
import ethereumAddressWalletMock from 'fixtures/address';
import transactions from 'fixtures/transactions';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

describe('ReceivePage', () => {
  let store;
  let trxActions;
  let accountsActions;
  let tokensActions;
  let wrapper;
  let router;
  let storeState;

  const walletAddress = ethereumWalletMock.getChecksumAddressString();
  const publicWalletAddress = ethereumAddressWalletMock.getChecksumAddressString();

  beforeEach(() => {
    trxActions = {
      updateTransactionHistory: jest.fn(),
    };
    accountsActions = {
      selectWallet: jest.fn(),
    };
    tokensActions = {
      getTokensWithBalanceByAddress: jest.fn().mockResolvedValue([]),
      getTokensBalancesByAddress: jest.fn().mockResolvedValue([]),
    };
    storeState = {
      modules: {
        web3: {
          namespaced: true,
          state: {
            activeCurrency: 'KEK',
            activeNet: {
              id: 1,
            },
          },
        },
        tokens: {
          namespaced: true,
          actions: tokensActions,
        },
        transactions: {
          namespaced: true,
          getters: {
            incomingTransactions: jest
              .fn()
              .mockReturnValue(transactions.ethplorerTransactions),
          },
          actions: trxActions,
        },
        accounts: {
          namespaced: true,
          state: {
            address: walletAddress,
            wallets: {
              [walletAddress]: ethereumWalletMock,
              [publicWalletAddress]: ethereumAddressWalletMock,
            },
          },
          actions: accountsActions,
          getters: {
            balance: jest.fn(),
            wallet: () => ethereumWalletMock,
          },
        },
      },
    };

    router = new VueRouter();
    store = new Vuex.Store(storeState);
    wrapper = shallow(ReceivePage, {
      localVue,
      store,
      router,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ReceivePage');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('getHistory', () => {
      it('should not call updateTransactionHistory if address is not present', async () => {
        expect.assertions(1);

        wrapper = shallow(ReceivePage, {
          localVue,
          store: new Vuex.Store(
            set(storeState, 'modules.accounts.state.address', null),
          ),
          router,
        });

        jest.clearAllMocks();

        await wrapper.vm.getHistory();

        expect(trxActions.updateTransactionHistory).not.toHaveBeenCalled();
      });

      it('should call updateTransactionHistory', async () => {
        expect.assertions(1);
        await wrapper.vm.getHistory();
        expect(trxActions.updateTransactionHistory).toHaveBeenCalled();
      });
    });

    describe('clickSendButton', () => {
      it('should call select wallet with passed address', () => {
        wrapper.vm.clickSendButton(walletAddress);
        expect(accountsActions.selectWallet).toHaveBeenCalledWith(
          expect.any(Object),
          walletAddress,
          undefined,
        );
      });

      it('should redirect to send', () => {
        router.push('/kek');
        expect(router.currentRoute.fullPath).toBe('/kek');
        wrapper.vm.clickSendButton(walletAddress);
        expect(router.currentRoute.fullPath).toBe('/send');
      });
    });
  });
});
