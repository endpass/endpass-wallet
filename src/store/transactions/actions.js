import Tx from 'ethereumjs-tx';
import { EventEmitter, NotificationError, Transaction } from '@/class';
import { MAIN_NET_ID } from '@/constants';
import ethplorerService from '@/services/ethplorer';
import web3 from '@/utils/web3';

const getNonceInBlock = async ({ rootState }) => {
  const address = rootState.accounts.address.getChecksumAddressString();

  return web3.eth.getTransactionCount(address);
};

const getNextNonce = async ({ state, dispatch }) => {
  const nonce = await dispatch('getNonceInBlock');
  const actualNonce = state.pendingTransactions
    .filter(tnx => tnx.state === 'pending')
    .map(tnx => tnx.nonce)
    .sort((a, b) => (a > b ? 1 : -1))
    .reduce((lastNonce, tnxNonce) => {
      if (lastNonce === tnxNonce) {
        return +tnxNonce + 1;
      }
      return lastNonce;
    }, nonce.toString())
    .toString();

  return actualNonce;
};

const sendSignedTransaction = async (
  { rootState, dispatch },
  { transaction, password },
) => {
  const { eth } = web3;
  const { wallet } = rootState.accounts;

  try {
    // let hash;

    if (!transaction.nonce) {
      const nonce = await dispatch('getNextNonce');
      Object.assign(transaction, { nonce });
    }

    const tx = new Tx(transaction.getApiObject(eth));
    await wallet.signTransaction(tx, password);
    const serializedTx = tx.serialize();
    const preparedTrx = `0x${serializedTx.toString('hex')}`;
    const eventEmitter = new EventEmitter();

    const sendEvent = eth
      .sendSignedTransaction(preparedTrx)
      .once('transactionHash', trxHash => {
        // hash = trxHash;
        eventEmitter.emit('transactionHash', trxHash);
      })
      .once('error', (err, receipt) => {
        const ignoreErrors = [
          'Transaction ran out of gas',
          'Transaction was not mined within750 seconds',
        ];
        const errInx = ignoreErrors.findIndex(errMsg =>
          err.message.includes(errMsg),
        );
        const isOutGas = errInx === 0 && receipt;

        if (errInx > 0 || isOutGas) {
          dispatch('handleSendingError', { err, receipt, transaction });
          eventEmitter.emit('error', err);
        }
      })
      .then(() => {
        eventEmitter.emit('confirmation');
      });
    // .catch(async ({ message }, receipt) => {
    //   if (message.includes('Transaction ran out of gas') && !receipt) {
    //     const interval = setInterval(async () => {
    //       const trx = await web3.eth.getTransactionReceipt(hash);

    //       if (trx && trx.status === true) {
    //         clearInterval(interval);
    //         eventEmitter.emit('confirmation');
    //       }
    //     }, 5000);
    //   }
    // });

    return eventEmitter;
  } catch (err) {
    dispatch('handleSendingError', { transaction });
  }
};

const sendTransaction = async (
  { dispatch, commit },
  { transaction, password },
) => {
  return dispatch('sendSignedTransaction', { transaction, password }).then(
    sendEvent =>
      new Promise((res, rej) => {
        sendEvent.once('transactionHash', hash => {
          // transaction.state = 'pending';
          // transaction.hash = hash;
          // transaction.date = new Date();
          Object.assign(transaction, {
            state: 'pending',
            hash,
            date: new Date(),
          });
          commit('addTransaction', transaction);
          res(hash);
        });

        sendEvent.once('confirmation', () => {
          console.log('sendEvent.once(confirmation)');
          const { hash } = transaction;
          const payload = { state: 'success' };

          commit('updateTransaction', {
            hash,
            payload,
          });
        });

        sendEvent.once('error', error => {
          const { hash } = transaction;
          const payload = { state: 'error', error };

          commit('updateTransaction', {
            hash,
            payload,
          });
          rej();
        });
      }),
  );
};

const resendTransaction = async (
  { dispatch, state, commit },
  { transaction, password },
) => {
  return dispatch('sendSignedTransaction', { transaction, password }).then(
    sendEvent =>
      new Promise((res, rej) => {
        const trxInList = state.pendingTransactions.find(
          trx => transaction.hash === trx.hash,
        );
        const { hash } = trxInList;

        sendEvent.once('transactionHash', newHash => {
          commit('updateTransaction', {
            hash,
            payload: { hash: newHash },
          });
          res(hash);
        });

        sendEvent.once('confirmation', () => {
          commit('updateTransaction', {
            hash,
            payload: { state: 'success' },
          });
        });

        sendEvent.once('error', error => {
          commit('updateTransaction', {
            hash,
            payload: { state: 'error', error },
          });
          rej();
        });
      }),
  );
};

const cancelTransaction = async (
  { state, dispatch, commit },
  { transaction, password },
) => {
  return dispatch('sendSignedTransaction', { transaction, password }).then(
    sendEvent =>
      new Promise((res, rej) => {
        const trxInList = state.pendingTransactions.find(
          trx => transaction.hash === trx.hash,
        );
        const { hash } = trxInList;

        sendEvent.once('transactionHash', async () => {
          const nonceInBlock = await dispatch('getNonceInBlock');

          if (trxInList.nonce == nonceInBlock) {
            const shortTnx = trxInList.hash.slice(0, 10);
            const error = new NotificationError({
              title: 'Try to cancel the transaction',
              text: `The cancellation ${shortTnx}... was started`,
            });
            dispatch('errors/emitError', error, { root: true });
          } else {
            // if a transaction with an too high nonce is canceled
            sendEvent.emit('confirmation');
          }
        });

        sendEvent.once('confirmation', () => {
          commit('updateTransaction', {
            hash,
            payload: { state: 'canceled' },
          });
          res();
        });

        sendEvent.once('error', error => {
          commit('updateTransaction', {
            hash,
            payload: { state: 'error', error },
          });
          rej();
        });
      }),
  );
};

const handleSendingError = (
  { dispatch },
  { err = {}, receipt, transaction = {} } = {},
) => {
  const { err: errorMessage = '' } = err;
  const cause =
    receipt || errorMessage.includes('out of gas')
      ? ', because out of gas'
      : '';
  const { hash } = transaction;
  const shortHash = hash ? `${hash.slice(0, 4)}...${hash.slice(-4)} ` : '';
  const error = new NotificationError({
    title: 'Error sending transaction',
    text: `Transaction ${shortHash}was not sent${cause}`,
    type: 'is-danger',
  });
  dispatch('errors/emitError', error, { root: true });
};

// Transaction history from ethplorer
const getTransactionHistory = async ({ commit, dispatch, rootState }) => {
  if (!rootState.accounts.address) return;

  try {
    const address = rootState.accounts.address.getChecksumAddressString();
    const [transactions, history] = await Promise.all([
      ethplorerService.getInfo(address),
      ethplorerService.getHistory(address),
    ]);
    const allTrx = transactions
      .concat(history)
      .map(trx => new Transaction(trx));

    commit('setTransactionHistory', allTrx);
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
const handleBlockTransactions = ({ dispatch, rootState }, transactions) => {
  const { wallets } = rootState.accounts;
  const userAddresses = Object.keys(wallets).map(wallet =>
    wallet.toLowerCase(),
  );
  const toUserTrx = transactions.filter(trx =>
    userAddresses.some(address => address === trx.to),
  );

  toUserTrx.forEach(trx => {
    const { hash, to } = trx;
    const shortAddress = `${to.slice(0, 4)}...${to.slice(-4)}`;
    const shortHash = `${hash.slice(0, 4)}...${hash.slice(-4)}`;
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
  const { id: currentNetID } = rootState.web3.activeNet;

  if (
    currentNetID === MAIN_NET_ID &&
    trxAddresses.some(trxAddress => trxAddress === address)
  ) {
    dispatch('getTransactionHistory');
  }
};

export default {
  handleBlockTransactions,
  handleSendingError,
  getNonceInBlock,
  getNextNonce,
  sendSignedTransaction,
  getTransactionHistory,
  sendTransaction,
  cancelTransaction,
  resendTransaction,
};
