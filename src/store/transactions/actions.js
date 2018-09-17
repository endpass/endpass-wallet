import { BigNumber } from 'bignumber.js';
import { EventEmitter, NotificationError, Transaction } from '@/class';
import ethplorerService from '@/services/ethplorer';
import web3 from '@/utils/web3';
import { getShortStringWithEllipsis } from '@/utils/strings';
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  SET_TRANSACTION_HISTORY,
} from './mutations-types';

const getNonceInBlock = async ({ rootState }) => {
  const address = rootState.accounts.address.getChecksumAddressString();
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
  { rootState, dispatch },
  { transaction, password },
) => {
  const { wallet } = rootState.accounts;

  try {
    if (!transaction.nonce) {
      const nonce = await dispatch('getNextNonce');

      Object.assign(transaction, { nonce });
    }

    const signedTx = await wallet.signTransaction(
      transaction.getApiObject(web3.eth),
      password,
    );
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
          const interval = setInterval(async () => {
            const trx = await web3.eth.getTransactionReceipt(hash);

            if (trx && trx.status === true) {
              clearInterval(interval);
              sendEvent.emit('confirmation');
            }
          }, 5000);
        }
      });

    return sendEvent;
  } catch (err) {
    dispatch('handleSendingError', { transaction });
  }
};

const handleSendingError = (
  { dispatch },
  { err = {}, receipt, transaction = {} } = {},
) => {
  const { err: errorMessage = '' } = err;
  const { hash } = transaction;
  const shortHash = hash ? getShortStringWithEllipsis(hash) : '';
  const cause =
    receipt || errorMessage.includes('out of gas')
      ? ', because out of gas'
      : '';
  const error = new NotificationError({
    title: 'Error sending transaction',
    text: `Transaction ${shortHash} was not sent${cause}`,
    type: 'is-danger',
  });

  dispatch('errors/emitError', error, { root: true });
};

// Transaction history from ethplorer
const updateTransactionHistory = async ({ commit, dispatch, rootState }) => {
  if (!rootState.accounts.address) return;

  try {
    const { address } = rootState.accounts;
    const addressCheckSum = address.getChecksumAddressString();
    let transactions = await ethplorerService.getTransactionHistory(
      addressCheckSum,
    );
    transactions = transactions.map(trx => new Transaction(trx));
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

// Show notification of incoming transactions from block
const handleBlockTransactions = (
  { dispatch, rootState, rootGetters },
  transactions,
) => {
  const userAddresses = rootGetters['accounts/getAccountAddresses'];
  const toUserTrx = transactions.filter(trx =>
    userAddresses.some(address => address === trx.to),
  );

  toUserTrx.forEach(trx => {
    const { hash, to } = trx;
    const shortAddress = getShortStringWithEllipsis(to);
    const shortHash = getShortStringWithEllipsis(hash);
    const error = new NotificationError({
      title: 'Incoming transaction',
      text: `Address ${shortAddress} received transaction ${shortHash}`,
    });

    dispatch('errors/emitError', error, { root: true });
  });

  if (!rootState.accounts.address) {
    return;
  }

  const address = rootState.accounts.address.getAddressString();
  const trxAddresses = toUserTrx.map(({ to }) => to);

  if (
    rootGetters['web3/isMainNetwork'] &&
    trxAddresses.some(trxAddress => trxAddress === address)
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
  Object.assign(transaction, {
    state: 'pending',
    date: new Date(),
    hash: newHash,
  });

  commit(ADD_TRANSACTION, transaction);

  return newHash;
};

const handleTransactionResendingHash = (
  { commit },
  { transaction, newHash },
) => {
  commit(UPDATE_TRANSACTION, {
    hash: transaction.hash,
    payload: {
      hash: newHash,
    },
  });

  return newHash;
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
    sendEvent.once('transactionHash', async newHash => {
      switch (actionType) {
        case 'send':
          return res(
            dispatch('handleTransactionSendingHash', {
              transaction,
              newHash,
            }),
          );
        case 'resend':
          return res(
            dispatch('handleTransactionResendingHash', {
              transaction,
              newHash,
            }),
          );
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
          state: actionType === 'cancel' ? 'canceled' : 'success',
        },
        hash: transaction.hash,
      });
    });

    sendEvent.once('error', error => {
      commit(UPDATE_TRANSACTION, {
        payload: {
          state: 'error',
          error,
        },
        hash: transaction.hash,
      });
      rej();
    });
  });

export default {
  handleTransactionSendingHash,
  handleTransactionResendingHash,
  handleTransactionCancelingHash,
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
};
