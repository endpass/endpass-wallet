import get from 'lodash/get';
import { BigNumber } from 'bignumber.js';
import { toChecksumAddress } from 'web3-utils';
import {
  EventEmitter,
  NotificationError,
  TransactionFactory,
  Transaction,
  web3,
} from '@/class';
import { TRANSACTION_STATUS } from '@/constants';
import cryptoDataService from '@/services/cryptoData';
import {
  getShortStringWithEllipsis,
  matchString,
} from '@endpass/utils/strings';
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  SET_TRANSACTION_HISTORY,
  SET_PENDING_TRANSACTIONS_FILTER_ID,
} from './mutations-types';

const getNonceInBlock = async ({ rootState }) => {
  const { address } = rootState.accounts;
  const nonce = await web3.eth.getTransactionCount(address);
  return nonce.toString();
};

const getNextNonce = async ({ state, dispatch }) => {
  const nonce = await dispatch('getNonceInBlock');
  const actualNonce = state.pendingTransactions
    .map(tnx => tnx.nonce)
    .sort((a, b) => (a > b ? 1 : -1))
    .reduce((acc, tnxNonce) => {
      if (acc === tnxNonce) {
        return BigNumber(tnxNonce)
          .plus('1')
          .toString();
      }

      return acc;
    }, nonce);

  return actualNonce;
};

const sendSignedTransaction = async (
  { dispatch, rootGetters },
  { transaction, password },
) => {
  const wallet = rootGetters['accounts/wallet'];
  let processdTransaction = transaction;
  try {
    if (!processdTransaction.nonce) {
      const nonce = await dispatch('getNextNonce');
      processdTransaction = Transaction.applyProps(processdTransaction, {
        nonce,
      });
    }

    const preTrx = {
      ...Transaction.getApiObject(processdTransaction),
      chainId: processdTransaction.networkId,
    };

    const signedTx = await wallet.signTransaction(preTrx, password);
    const sendEvent = new EventEmitter();
    let hash;

    web3.eth
      .sendSignedTransaction(signedTx)
      .once('transactionHash', trxHash => {
        hash = trxHash;
        sendEvent.emit('transactionHash', trxHash);
      })
      .then(() => {
        sendEvent.emit('confirmation');
      })
      .catch(async (err, receipt) => {
        const ignoreErrors = [
          'Transaction ran out of gas',
          'Transaction was not mined within750 seconds',
        ];
        const errIndex = ignoreErrors.findIndex(errMsg =>
          err.message.includes(errMsg),
        );
        const isIgnoreOutGas = errIndex === 0 && !receipt;

        if (errIndex === -1 || !isIgnoreOutGas) {
          dispatch('handleSendingError', { err, receipt, transaction });
          sendEvent.emit('error', err);
        } else {
          const intervalId = setInterval(async () => {
            const trx = await web3.eth.getTransactionReceipt(hash);

            if (trx && trx.status === true) {
              clearInterval(intervalId);
              sendEvent.emit('confirmation');
            }
          }, 5000);
        }
      });

    return sendEvent;
  } catch (err) {
    dispatch('handleSendingError', { err, processdTransaction });

    return null;
  }
};

const handleSendingError = (
  { dispatch },
  { err = {}, receipt, transaction = {} } = {},
) => {
  const errorMessage = get(err, 'err') || get(err, 'message') || '';
  const { hash } = transaction;
  const shortHash = hash ? ` ${getShortStringWithEllipsis(hash)}` : '';
  let cause = '';

  if (receipt || matchString(errorMessage, 'out of gas')) {
    cause = ', because out of gas';
  } else if (matchString(errorMessage, 'gas is too low')) {
    cause = ', because gas is too low';
  } else if (matchString(errorMessage, 'gas price is too low')) {
    cause = ', because gas price is too low';
  }

  const error = new NotificationError({
    title: 'Error sending transaction',
    text: `Transaction${shortHash} was not sent${cause}`,
    type: 'is-danger',
  });

  dispatch('errors/emitError', error, { root: true });
};

// Transaction history from ethplorer
const updateTransactionHistory = async ({ commit, dispatch, rootState }) => {
  if (!rootState.accounts.address) return;

  try {
    const { address } = rootState.accounts;
    const networkId = rootState.web3.activeNet.id;
    const res = await cryptoDataService.getTransactionHistory({
      address,
      network: networkId,
    });
    const transactions = res.map(trx =>
      TransactionFactory.fromCryptoDataHistory(trx),
    );

    commit(SET_TRANSACTION_HISTORY, transactions);
    dispatch(
      'connectionStatus/updateApiErrorStatus',
      {
        id: 'ethplorer',
        status: true,
      },
      { root: true },
    );
  } catch (e) {
    const error = new NotificationError({
      ...e,
      title: 'Failed to get transaction information',
      text:
        'An error occurred while retrieving transaction information. Please try again.',
      type: 'is-warning',
      apiError: {
        id: 'ethplorer',
        status: false,
      },
    });

    dispatch('errors/emitError', error, { root: true });
  }
};

const handleIncomingTransaction = async (
  { commit, state },
  { transaction },
) => {
  const { pendingTransactions, transactionHistory } = state;
  const allTrx = [...pendingTransactions, ...transactionHistory];
  const savedTransaction = allTrx.find(trxInList =>
    Transaction.isEqual(transaction, trxInList, ['networkId', 'nonce']),
  );

  if (!savedTransaction) {
    commit(ADD_TRANSACTION, transaction);
  } else if (
    savedTransaction.state === TRANSACTION_STATUS.PENDING &&
    transaction.state !== TRANSACTION_STATUS.PENDING
  ) {
    commit(UPDATE_TRANSACTION, {
      payload: {
        state: transaction.state,
      },
      hash: savedTransaction.hash,
    });
  }
};

// Show notification of incoming transactions from block
const handleBlockTransactions = (
  { dispatch, rootState, rootGetters },
  { transactions, networkId },
) => {
  const userAddresses = rootGetters['accounts/accountAddresses'];
  const userTrx = transactions.filter(trx => {
    if (!trx.to) {
      return false;
    }

    const checksumTrxFrom = toChecksumAddress(trx.from);
    const checksumTrxTo = toChecksumAddress(trx.to);

    return userAddresses.some(address => {
      const checksumAddress = toChecksumAddress(address);

      return (
        checksumAddress === checksumTrxFrom || checksumAddress === checksumTrxTo
      );
    });
  });

  if (!userTrx.length) return;

  userTrx.forEach(trx => {
    const transaction = TransactionFactory.fromBlock({ ...trx, networkId });
    const incomeTrx = userAddresses.find(
      address => toChecksumAddress(trx.to) === toChecksumAddress(address),
    );

    dispatch('handleIncomingTransaction', { transaction });

    if (incomeTrx) {
      const { hash, to } = trx;
      const shortAddress = getShortStringWithEllipsis(to);
      const shortHash = getShortStringWithEllipsis(hash);
      const error = new NotificationError({
        title: 'Incoming transaction',
        text: `Address ${shortAddress} received transaction ${shortHash}`,
      });

      dispatch('errors/emitError', error, { root: true });
    }
  });

  const { address } = rootState.accounts;

  if (
    address &&
    rootGetters['web3/isMainNetwork'] &&
    userTrx.some(({ from, to }) => from === address || to === address)
  ) {
    dispatch('updateTransactionHistory');
  }
};

const sendTransaction = async ({ dispatch }, { transaction, password }) => {
  const sendEvent = await dispatch('sendSignedTransaction', {
    transaction,
    password,
  });
  const res = await dispatch('processTransactionAction', {
    actionType: 'send',
    transaction,
    sendEvent,
  });

  return res;
};

const resendTransaction = async ({ dispatch }, { transaction, password }) => {
  const sendEvent = await dispatch('sendSignedTransaction', {
    transaction,
    password,
  });
  const res = await dispatch('processTransactionAction', {
    actionType: 'resend',
    transaction,
    sendEvent,
  });

  return res;
};

const cancelTransaction = async ({ dispatch }, { transaction, password }) => {
  const sendEvent = await dispatch('sendSignedTransaction', {
    transaction,
    password,
  });
  const res = await dispatch('processTransactionAction', {
    actionType: 'cancel',
    transaction,
    sendEvent,
  });

  return res;
};

const handleTransactionSendingHash = ({ commit }, { transaction, newHash }) => {
  const trx = Transaction.applyProps(transaction, {
    state: 'pending',
    date: new Date(),
    hash: newHash,
  });

  commit(ADD_TRANSACTION, trx);
};

const handleTransactionResendingHash = ({ commit }, { hash, newHash }) => {
  commit(UPDATE_TRANSACTION, {
    hash,
    payload: {
      hash: newHash,
    },
  });
};

const handleTransactionCancelingHash = async (
  { dispatch, getters },
  { transaction, sendEvent },
) => {
  const { nonce, hash } = getters.getPendingTransactionByHash(transaction.hash);
  const nonceInBlock = await dispatch('getNonceInBlock');

  if (nonce === nonceInBlock) {
    const shortTnx = hash.slice(0, 10);
    const error = new NotificationError({
      title: 'Try to cancel the transaction',
      text: `The cancellation ${shortTnx}... was started`,
    });
    dispatch('errors/emitError', error, { root: true });
  } else {
    // if a transaction with an too high nonce is canceled
    sendEvent.emit('confirmation');
  }
};

const processTransactionAction = async (
  { dispatch, commit },
  { transaction, sendEvent, actionType },
) =>
  new Promise((res, rej) => {
    let usedHash = transaction.hash;

    sendEvent.once('transactionHash', async newHash => {
      switch (actionType) {
        case 'send':
          await dispatch('handleTransactionSendingHash', {
            transaction,
            newHash,
          });
          usedHash = newHash;

          return res(usedHash);
        case 'resend':
          await dispatch('handleTransactionResendingHash', {
            hash: usedHash,
            newHash,
          });

          usedHash = newHash;
          return res(newHash);
        case 'cancel':
          await dispatch('handleTransactionCancelingHash', {
            transaction,
            sendEvent,
          });
          return res();
        default:
          return res();
      }
    });

    sendEvent.once('confirmation', () => {
      commit(UPDATE_TRANSACTION, {
        payload: {
          state:
            actionType === 'cancel'
              ? TRANSACTION_STATUS.CANCELED
              : TRANSACTION_STATUS.SUCCESS,
        },
        hash: usedHash,
      });
    });

    sendEvent.once('error', error => {
      if (usedHash) {
        commit(UPDATE_TRANSACTION, {
          payload: {
            state: 'error',
            error,
          },
          hash: usedHash,
        });
      }

      rej();
    });
  });

const getPendingTransactions = async ({
  state,
  commit,
  dispatch,
  rootState,
  rootGetters,
}) => {
  try {
    const { pendingTransactionsFilterId } = state;
    const { address } = rootState.accounts;
    const networkId = rootGetters['web3/activeNetwork'];

    if (!address) {
      return;
    }

    const {
      filterId,
      transactions,
    } = await cryptoDataService.getPendingTransactions(
      networkId,
      address,
      pendingTransactionsFilterId,
    );

    if (filterId !== pendingTransactionsFilterId) {
      commit(SET_PENDING_TRANSACTIONS_FILTER_ID, filterId);
    }

    transactions.forEach(transaction => {
      const trx = Transaction.applyProps(
        TransactionFactory.fromCryptoData(transaction),
        {
          state: TRANSACTION_STATUS.PENDING,
        },
      );

      dispatch('handleIncomingTransaction', { transaction: trx });
    });
  } catch (error) {
    dispatch('errors/emitError', error, { root: true });
  }
};

const updatePendingTransactionsStatus = async ({
  state,
  commit,
  rootGetters,
  dispatch,
}) => {
  try {
    const pendingTransactions = state.pendingTransactions.filter(
      ({ state, networkId }) =>
        state === TRANSACTION_STATUS.PENDING &&
        networkId === rootGetters['web3/activeNetwork'],
    );
    const receipts = await Promise.all(
      pendingTransactions.map(({ hash }) =>
        web3.eth.getTransactionReceipt(hash),
      ),
    );

    receipts.forEach((receipt, index) => {
      if (!receipt) {
        return;
      }

      commit(UPDATE_TRANSACTION, {
        payload: {
          state: receipt.status
            ? TRANSACTION_STATUS.SUCCESS
            : TRANSACTION_STATUS.ERROR,
        },
        hash: pendingTransactions[index].hash,
      });
    });
  } catch (e) {
    const error = new NotificationError({
      title: 'Failed to update pending transactions',
      text: 'An error occurred while updating pending transactions.',
      type: 'is-warning',
    });

    dispatch('errors/emitError', error, { root: true });
  }
};

export default {
  handleTransactionSendingHash,
  handleTransactionResendingHash,
  handleTransactionCancelingHash,
  handleIncomingTransaction,
  handleBlockTransactions,
  handleSendingError,
  getNonceInBlock,
  getNextNonce,
  sendSignedTransaction,
  updateTransactionHistory,
  sendTransaction,
  cancelTransaction,
  resendTransaction,
  processTransactionAction,
  getPendingTransactions,
  updatePendingTransactionsStatus,
};
