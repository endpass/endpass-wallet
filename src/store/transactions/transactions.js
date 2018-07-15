import Tx from 'ethereumjs-tx';
import { BigNumber } from 'bignumber.js';
import { EventEmitter, NotificationError } from '@/class';

export default {
  namespaced: true,
  state: {
    pendingTransactions: [],
  },
  getters: {
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
    async sendSignedTransaction(
      { rootState, state, dispatch },
      { transaction, password }
    ) {
      const address = rootState.accounts.address.getAddressString();
      const eth = rootState.web3.web3.eth;
      const wallet = rootState.accounts.wallet;

      try {
        if (!transaction.nonce) {
          const nonce = await eth.getTransactionCount(address);
          const pendingLength = state.pendingTransactions.filter(
            tnx => tnx.state === 'pending'
          ).length;
          transaction.nonce = (nonce + pendingLength).toString();
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
            dispatch('handleSendingError', receipt);
            eventEmitter.emit('error');
          });

        return eventEmitter;
      } catch (e) {
        dispatch('handleSendingError');
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

            sendEvent.once('error', rej);
          })
      );
    },
    resendTransaction({ dispatch, state }, { transaction, password }) {
      return dispatch('sendSignedTransaction', { transaction, password }).then(
        sendEvent =>
          new Promise((res, rej) => {
            const trxInList = state.pendingTransactions.find(
              trx => transaction.hash === trx.hash
            );

            sendEvent.once('transactionHash', hash => {
              trxInList.hash = hash;
              res(hash);
            });

            sendEvent.once('confirmation', () => {
              trxInList.state = 'success';
            });

            sendEvent.once('error', rej);
          })
      );
    },
    cancelTransaction({ state, dispatch }, { transaction, password }) {
      return dispatch('sendSignedTransaction', { transaction, password }).then(
        sendEvent =>
          new Promise((res, rej) => {
            const trxInList = state.pendingTransactions.find(
              trx => transaction.hash === trx.hash
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

            sendEvent.once('error', rej);
          })
      );
    },
    handleSendingError({ dispatch }, receipt) {
      const cause = receipt ? ', because out of gas' : '';
      const error = new NotificationError({
        title: 'Error sending transaction',
        text: `Transaction was not sent${cause}`,
        type: 'is-danger',
      });
      dispatch('errors/emitError', error, { root: true });
    },
  },
};
