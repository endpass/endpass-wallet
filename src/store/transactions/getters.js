import { BigNumber } from 'bignumber.js';
import web3 from '@/utils/web3';
import { MAIN_NET_ID } from '@/constants';

const accountTransactions = (state, getters, rootState) => {
  if (!rootState.accounts.address) {
    return [];
  }

  const { id: currentNetID } = rootState.web3.activeNet;
  const address = rootState.accounts.address.getChecksumAddressString();
  const transactions = [...state.pendingTransactions];

  if (currentNetID === MAIN_NET_ID) {
    transactions.push(...getters.filteredHistoryTransactions);
  }

  return transactions
    .filter(trx => {
      const { to, from, state: trxStatus } = trx;

      return (
        web3.utils.toChecksumAddress(from) === address ||
        (trxStatus === 'success' &&
          web3.utils.toChecksumAddress(to) === address)
      );
    })
    .sort((trx1, trx2) => {
      if (!trx2.date) {
        return 1;
      }

      if (!trx1.date) {
        return -1;
      }

      return trx2.date - trx1.date;
    });
};

const pendingBalance = (state, getters, rootState) => {
  if (!rootState.accounts.address) {
    return '0';
  }

  const address = rootState.accounts.address.getChecksumAddressString();
  const networkId = rootState.web3.activeNet.id;

  return state.pendingTransactions
    .filter(
      tnx =>
        tnx.state === 'pending' &&
        tnx.from === address &&
        tnx.networkId === networkId,
    )
    .map(tnx => {
      const tnxValue = tnx.token === 'ETH' ? tnx.valueWei : '0';

      return BigNumber(tnx.gasCost).plus(tnxValue);
    })
    .reduce((total, item) => total.plus(item), BigNumber('0'))
    .toFixed();
};

// Exclude trx that exist in pendingTransactions
const filteredHistoryTransactions = state => {
  const isInPending = itemHash =>
    state.pendingTransactions.some(({ hash }) => hash === itemHash);

  return state.transactionHistory.filter(({ hash }) => !isInPending(hash));
};

// Trx for the current network
const currentNetTransactions = (state, getters, rootState) => {
  const { id: currentNetID } = rootState.web3.activeNet;

  return getters.accountTransactions.filter(
    ({ networkId }) => networkId === currentNetID,
  );
};

const getPendingTransactions = state => state.pendingTransactions;

const getTransactionByHash = state => hash =>
  state.transactionHistory.find(trx => trx.hash === hash);

const getPendingTransactionByHash = state => hash =>
  state.pendingTransactions.find(trx => trx.hash === hash);

export default {
  pendingBalance,
  filteredHistoryTransactions,
  currentNetTransactions,
  accountTransactions,
  getPendingTransactions,
  getPendingTransactionByHash,
  getTransactionByHash,
};
