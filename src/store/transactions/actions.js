import { get } from 'lodash';
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
import ethplorerService from '@/services/ethplorer';
import {
  getShortStringWithEllipsis,
  matchString,
} from '@endpass/utils/strings';
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  SET_TRANSACTION_HISTORY,
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

  try {
    if (!transaction.nonce) {
      const nonce = await dispatch('getNextNonce');
      transaction = Transaction.applyProps(transaction, { nonce });
    }

    const preTrx = {
      ...Transaction.getApiObject(transaction),
      chainId: transaction.networkId,
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
    dispatch('handleSendingError', { err, transaction });

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
    const res = await ethplorerService.getTransactionHistory(address);
    const transactions = res.map(trx => TransactionFactory.fromSendForm(trx));

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
  { state, dispatch, commit, rootState, rootGetters },
  { transactions, networkId },
) => {
  const userAddresses = rootGetters['accounts/accountAddresses'];
  const toUserTrx = transactions.filter(
    trx =>
      trx.to &&
      userAddresses.some(
        address => toChecksumAddress(address) === toChecksumAddress(trx.to),
      ),
  );

  if (!toUserTrx.length) return;

  const { pendingTransactions, transactionHistory } = state;
  const allTrx = [...pendingTransactions, ...transactionHistory];

  toUserTrx.forEach(trx => {
    const incomeTrx = TransactionFactory.fromBlock({ ...trx, networkId });

    const isCanceled = allTrx.some(trxInList =>
      Transaction.isEqual(incomeTrx, trxInList, ['networkId', 'nonce']),
    );

    const isTrxExist = allTrx.some(trxInList =>
      Transaction.isEqual(incomeTrx, trxInList),
    );

    if (!isTrxExist && !isCanceled) {
      commit(ADD_TRANSACTION, incomeTrx);
    }

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

  const { address } = rootState.accounts;
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
