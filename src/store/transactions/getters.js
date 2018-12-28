import { BigNumber } from 'bignumber.js';
import { uniq, uniqWith } from 'lodash';
import { MAIN_NET_ID } from '@/constants';
import { Transaction, web3 } from '@/class';

const { toChecksumAddress } = web3.utils;

const accountTransactions = (state, getters, rootState) => {
  if (!rootState.accounts.address) {
    return [];
  }

  const { id: currentNetID } = rootState.web3.activeNet;
  const { address } = rootState.accounts;
  const transactions = [...state.pendingTransactions];

  if (currentNetID === MAIN_NET_ID) {
    transactions.push(...getters.filteredHistoryTransactions);
  }

  const allAccountTrx = transactions
    .filter(trx => {
      const { to, from, state: trxStatus } = trx;

      return (
        toChecksumAddress(from) === address ||
        (trxStatus === 'success' && toChecksumAddress(to) === address)
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

  return uniqWith(allAccountTrx, Transaction.isEqual);
};

const pendingBalance = (state, getters, rootState) => {
  const { address } = rootState.accounts;

  if (!address) {
    return '0';
  }

  const networkId = rootState.web3.activeNet.id;

  return state.pendingTransactions
    .filter(
      tnx =>
        tnx.state === 'pending' &&
        tnx.from === address &&
        tnx.networkId === networkId,
    )
    .map(Transaction.getUpGasCost)
    .reduce((total, item) => total.plus(item), BigNumber('0'))
    .toFixed();
};

// Exclude trx that exist in pendingTransactions
const filteredHistoryTransactions = state => {
  const isInPending = trx =>
    state.pendingTransactions.some(pendingTrx =>
      Transaction.isEqual(trx, pendingTrx),
    );

  return state.transactionHistory.filter(trx => !isInPending(trx));
};

// Trx for the current network
const currentNetTransactions = (state, getters, rootState) => {
  const { id: currentNetID } = rootState.web3.activeNet;

  return getters.accountTransactions.filter(
    ({ networkId }) => networkId === currentNetID,
  );
};

const incomingTransactions = (state, getters, rootState) => {
  const { address } = rootState.accounts;

  if (!address) {
    return [];
  }

  return getters.currentNetTransactions.filter(({ to }) => to === address);
};

const getPendingTransactions = state => state.pendingTransactions;

const getTransactionByHash = state => hash =>
  state.transactionHistory.find(trx => trx.hash === hash);

const getPendingTransactionByHash = state => hash =>
  state.pendingTransactions.find(trx => trx.hash === hash);

const addressesFromTransactionsHistory = state =>
  uniq(state.transactionHistory.map(({ to }) => to));

const getAddressesFromPendingTransactions = state =>
  uniq(state.pendingTransactions.map(({ to }) => to));

const addressesFromTransactions = (state, getters) =>
  uniq(
    getters.addressesFromTransactionsHistory.concat(
      getters.getAddressesFromPendingTransactions,
    ),
  );

const allowedToSendAddresses = (state, getters, rootState) =>
  uniq(
    Object.keys(rootState.accounts.wallets),
    getters.addressesFromTransactions,
  );

export default {
  getPendingTransactions,
  getPendingTransactionByHash,
  getTransactionByHash,
  addressesFromTransactionsHistory,
  getAddressesFromPendingTransactions,
  addressesFromTransactions,
  allowedToSendAddresses,
  pendingBalance,
  filteredHistoryTransactions,
  currentNetTransactions,
  accountTransactions,
  incomingTransactions,
};
