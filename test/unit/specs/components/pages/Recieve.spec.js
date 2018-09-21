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
  let tokensActions;
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

    tokensActions = {
      getTokensWithBalanceByAddress: jest.fn().mockResolvedValue([]),
      getTokensBalancesByAddress: jest.fn().mockResolvedValue([]),
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
        expect.assertions(1);
        trxActions.updateTransactionHistory.mockClear();
        wrapper.setComputed({
          address: null,
        });
        await wrapper.vm.getHistory();
        expect(trxActions.updateTransactionHistory).not.toHaveBeenCalled();
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
        expect.assertions(2);
        wrapper.vm.getBalances();
        expect(wrapper.vm.balances[publicWalletAddress]).toBe(
          '0.000000000000000001',
        );
        expect(wrapper.vm.balances[walletAddress]).toBe('0.000000000000000001');
      });
    });
    describe('getTokensLists', () => {
      it('should call get getTokensList with all wallets', () => {
        const getTokensList = jest.fn();
        wrapper.setMethods({
          getTokensList,
        });
        getTokensList.mockClear();
        wrapper.vm.getTokensLists();
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
    describe('getTokensList', () => {
      it('should call get tokens and balances and merge them for all wallets', async () => {
        expect.assertions(3);
        tokensActions.getTokensBalancesByAddress.mockClear();
        tokensActions.getTokensWithBalanceByAddress.mockClear();
        tokensActions.getTokensBalancesByAddress.mockReturnValue({
          [walletAddress]: '0',
        });
        tokensActions.getTokensWithBalanceByAddress.mockReturnValue([
          {
            address: walletAddress,
          },
        ]);
        await wrapper.vm.getTokensList(walletAddress);
        expect(
          tokensActions.getTokensWithBalanceByAddress,
        ).toHaveBeenCalledTimes(1);
        expect(tokensActions.getTokensBalancesByAddress).toHaveBeenCalledTimes(
          1,
        );
        expect(wrapper.vm.tokens[walletAddress]).toMatchObject([
          {
            address: walletAddress,
            balance: '0',
          },
        ]);
      });
    });
  });
});
