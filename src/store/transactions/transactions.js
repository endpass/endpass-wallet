import Tx from 'ethereumjs-tx';
import { BigNumber } from 'bignumber.js';
import { EventEmitter, NotificationError } from '@/class';

export default {
  namespaced: true,
  state: {
    pendingTransactions: [],
  },
  getters: {
    accountTransactions(state, getters, rootState) {
      const address = rootState.accounts.address.getAddressString();
      return state.pendingTransactions.filter(trx => {
        return (
          trx.from === address ||
          (trx.to === address && trx.status === 'success')
        );
      });
    },
    pendingBalance(state) {
      return state.pendingTransactions
        .filter(tnx => tnx.state === 'pending')
        .map(tnx => {
          const tnxValue = tnx.token === 'ETH' ? tnx.valueWei : '0';

          return BigNumber(tnx.gasCost).plus(tnxValue);
        })
        .reduce((total, item) => total.plus(item), BigNumber('0'))
        .toFixed();
    },
  },
  mutations: {
    addTransaction(state, transaction) {
      state.pendingTransactions.push(transaction);
    },
  },
  actions: {
    async getNonceInBlock({ rootState }) {
      const address = rootState.accounts.address.getAddressString();
      const eth = rootState.web3.web3.eth;
      return await eth.getTransactionCount(address);
    },
    async getNextNonce({ state, dispatch }) {
      const nonce = await dispatch('getNonceInBlock');
      const actualNonce = state.pendingTransactions
        .filter(tnx => tnx.state === 'pending')
        .map(tnx => tnx.nonce)
        .sort((a, b) => (a > b ? 1 : -1))
        .reduce((lastNonce, tnxNonce) => {
          if (lastNonce === tnxNonce) {
            return +tnxNonce + 1;
          } else {
            return lastNonce;
          }
        }, nonce.toString())
        .toString();

      return actualNonce;
    },
    async sendSignedTransaction(
      { rootState, state, dispatch },
      { transaction, password },
    ) {
      const eth = rootState.web3.web3.eth;
      const wallet = rootState.accounts.wallet;

      try {
        if (!transaction.nonce) {
          transaction.nonce = await dispatch('getNextNonce');
        }

        const tx = new Tx(transaction.getApiObject(eth));
        wallet.signTransaction(tx, password);
        const serializedTx = tx.serialize();
        const preparedTrx = `0x${serializedTx.toString('hex')}`;
        const eventEmitter = new EventEmitter();

        const sendEvent = eth
          .sendSignedTransaction(preparedTrx)
          .once('transactionHash', hash => {
            eventEmitter.emit('transactionHash', hash);
          })
          .on('confirmation', confNumber => {
            if (confNumber > 0) {
              sendEvent.off('confirmation');
              eventEmitter.emit('confirmation', confNumber);
            }
          })
          .once('error', (err, receipt) => {
            dispatch('handleSendingError', { err, receipt, transaction });
            eventEmitter.emit('error', err);
          });

        return eventEmitter;
      } catch (err) {
        dispatch('handleSendingError', { transaction });
      }
    },
    sendTransaction({ dispatch, commit }, { transaction, password }) {
      return dispatch('sendSignedTransaction', { transaction, password }).then(
        sendEvent =>
          new Promise((res, rej) => {
            sendEvent.once('transactionHash', hash => {
              transaction.state = 'pending';
              transaction.hash = hash;
              commit('addTransaction', transaction);
              res(hash);
            });

            sendEvent.once('confirmation', () => {
              transaction.state = 'success';
            });

            sendEvent.once('error', err => {
              transaction.state = 'error';
              transaction.error = err;
              rej();
            });
          }),
      );
    },
    resendTransaction({ dispatch, state }, { transaction, password }) {
      return dispatch('sendSignedTransaction', { transaction, password }).then(
        sendEvent =>
          new Promise((res, rej) => {
            const trxInList = state.pendingTransactions.find(
              trx => transaction.hash === trx.hash,
            );

            sendEvent.once('transactionHash', hash => {
              trxInList.hash = hash;
              res(hash);
            });

            sendEvent.once('confirmation', () => {
              trxInList.state = 'success';
            });

            sendEvent.once('error', err => {
              trxInList.state = 'error';
              trxInList.error = err;
              rej();
            });
          }),
      );
    },
    cancelTransaction({ state, dispatch }, { transaction, password }) {
      return dispatch('sendSignedTransaction', { transaction, password }).then(
        sendEvent =>
          new Promise((res, rej) => {
            const trxInList = state.pendingTransactions.find(
              trx => transaction.hash === trx.hash,
            );

            sendEvent.once('transactionHash', () => {
              const shortTnx = trxInList.hash.slice(0, 10);
              const error = new NotificationError({
                title: 'Try to cancel the transaction',
                text: `The cancellation ${shortTnx}... was started`,
              });
              dispatch('errors/emitError', error, { root: true });
            });

            sendEvent.once('confirmation', () => {
              trxInList.state = 'canceled';
              res();
            });

            sendEvent.once('error', err => {
              trxInList.state = 'error';
              trxInList.error = err;
              rej();
            });
          }),
      );
    },
    handleSendingError({ dispatch }, { err, receipt, transaction }) {
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
    },
  },
};
