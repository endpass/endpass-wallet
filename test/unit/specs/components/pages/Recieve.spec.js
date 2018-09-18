import { shallow, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Address } from '@/class';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import ReceivePage from '@/components/pages/Receive.vue';
import web3 from 'web3';
import ethereumWalletMock from '../../../fixtures/wallet.js';
import ethereumAddressWalletMock from '../../../fixtures/address.js';
import transactions from '../../../fixtures/transactions.js';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

describe('ReceivePage', () => {
  let store;
  let mock;
  let trxActions;
  let accountsActions;
  let wrapper;
  let router;
  const walletAddress = ethereumWalletMock.getChecksumAddressString();
  const publicWalletAddress = ethereumAddressWalletMock.getChecksumAddressString();
  beforeEach(() => {
    trxActions = {
      updateTransactionHistory: jest.fn(),
    };

    accountsActions = {
      selectWallet: jest.fn(),
    };

    mock = new MockAdapter(axios);
    router = new VueRouter();
    store = new Vuex.Store({
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
            address: ethereumWalletMock,
            wallets: {
              [walletAddress]: ethereumWalletMock,
              [publicWalletAddress]: ethereumAddressWalletMock,
            },
          },
          actions: accountsActions,
          getters: {
            balance: jest.fn(),
          },
        },
      },
    });
    wrapper = shallow(ReceivePage, {
      localVue,
      store,
      router,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('receive-page');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('getHistory', () => {
      it("shouldn't call updateTransactionHistory if address is not present", async () => {
        expect.assertions(2);
        expect(trxActions.updateTransactionHistory).toHaveBeenCalledTimes(1);
        wrapper.setComputed({
          address: null,
        });
        await wrapper.vm.getHistory();
        expect(trxActions.updateTransactionHistory).toHaveBeenCalledTimes(1);
      });
      it('should call updateTransactionHistory', async () => {
        expect.assertions(1);
        await wrapper.vm.getHistory();
        expect(trxActions.updateTransactionHistory).toHaveBeenCalled();
      });
    });
    describe('isTokensLoaded', () => {
      it('should return false if tokens is undefined', () => {
        expect(wrapper.vm.isTokensLoaded(walletAddress)).toBe(false);
      });
      it('should return true if tokens is not undefined', () => {
        wrapper.setData({
          tokens: {
            [walletAddress]: [],
          },
        });
        expect(wrapper.vm.isTokensLoaded(walletAddress)).toBe(true);
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
    describe('getBalances', () => {
      it('should call getBalance with all wallets', () => {
        const getBalance = jest.fn();
        wrapper.setMethods({
          getBalance,
        });
        expect(getBalance).toHaveBeenCalledTimes(2);
        expect(getBalance).toHaveBeenNthCalledWith(1, walletAddress, 0, [
          walletAddress,
          publicWalletAddress,
        ]);
        expect(getBalance).toHaveBeenNthCalledWith(2, publicWalletAddress, 1, [
          walletAddress,
          publicWalletAddress,
        ]);
      });
    });
    describe('getBalance', () => {
      it('should get and set balance', async () => {
        expect.assertions(1);
        await wrapper.vm.getBalance(walletAddress);
        expect(wrapper.vm.balances[walletAddress]).toBe('0.000000000000000001');
      });
    });
    describe('getBalance', () => {
      it('should get and set balance', async () => {
        expect.assertions(1);
        await wrapper.vm.getBalance(walletAddress);
        expect(wrapper.vm.balances[walletAddress]).toBe('0.000000000000000001');
      });
    });
    describe('getTokensLists', () => {
      it('should call getTokensList with all wallets', () => {
        const getTokensList = jest.fn();
        wrapper.setMethods({
          getTokensList,
        });
        expect(getTokensList).toHaveBeenCalledTimes(2);
        expect(getTokensList).toHaveBeenNthCalledWith(1, walletAddress, 0, [
          walletAddress,
          publicWalletAddress,
        ]);
        expect(getTokensList).toHaveBeenNthCalledWith(
          2,
          publicWalletAddress,
          1,
          [walletAddress, publicWalletAddress],
        );
      });
    });
  });

  // done callback is required for async tests
  // it.only('downloads transaction history', async () => {
  //   mock
  //     .onGet(/api\.ethplorer\.io\/getAddressTransactions/)
  //     .reply(200, [{ id: '1', to: wallet.getChecksumAddressString() }]);
  //
  //   // new wrapper must be initialized in each test AFTER setting up mock
  //   const wrapper = shallow(ReceivePage, { store, localVue });
  //   // Wait for promises in created() hook to resolve
  //   await flushPromises();
  //
  //   let elems = wrapper.vm.transactions;
  //   expect(elems.length).toBe(1);
  //   expect(elems[0].to).toBe(wrapper.vm.address);
  // });
});
