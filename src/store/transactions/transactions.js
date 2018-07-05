import Tx from 'ethereumjs-tx';

export default {
  namespaced: true,
  state: {
    pendingTransactions: [],
  },
  mutations: {
    addTransaction(state, transaction) {
      state.pendingTransactions.push(transaction);
    },
    removeTransaction(state, trxHash) {
      let trxIndex = state.pendingTransactions.findIndex((trx) => {
        return trx.hash === trxHash;
      });
      if(state.pendingTransactions[trxIndex].state === 'canseled')
        return
      state.pendingTransactions.splice(trxIndex,1);
    },
    canselTransaction(state, trxHash) {
      let trxIndex = state.pendingTransactions.findIndex((trx) => {
        return trx.hash === trxHash;
      });
      state.pendingTransactions[trxIndex].state = 'canseled';
    },
    updateTransaction(state, data) {
      const trxForUpdate = state.pendingTransactions.find(
        trx => trx.hash === data.hash
      );
      Object.assign(trxForUpdate, data);
    }
  },
  actions: {
    sendTransaction({rootState, state, dispatch, commit}, {transaction, password}) {
      const eth = rootState.web3.web3.eth,
      address = rootState.accounts.address.getAddressString(),
      wallet = rootState.accounts.wallet;
      return new Promise((res, rej) => {
        eth.getTransactionCount(address).then(nonce => {
          const pendingLength = state.pendingTransactions.filter(
            tnx => tnx.state === 'pending'
          ).length;
          transaction.nonce = transaction.nonce || (nonce + pendingLength).toString();
          const tx = new Tx(transaction.getApiObject(eth));
          dispatch('signTransaction', {transaction: tx, password});
          const serializedTx = tx.serialize();
          const sendEvent = eth
            .sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('transactionHash', hash => {
              sendEvent.off('transactionHash');
              transaction.state = 'pending';
              transaction.hash = hash;
              commit('addTransaction', transaction);
              res()
            })
            .on('confirmation', (confNumber, { transactionHash }) => {
              if (confNumber > 0) {
                sendEvent.off('confirmation');
                transaction.state = 'success';
              }
            })
            .on('error', (err, receipt) => {
              sendEvent.off('error');
              const cause = receipt ? ', because out of gas' : '';
              rej({
                title: 'Error sending transaction',
                text: `Transaction was not sent${cause}`,
                type: 'is-danger',
              });
            });
        });
      });
    },
    signTransaction({rootState}, {transaction, password}){
      return rootState.accounts.wallet.signTransaction(transaction, password);
    }
  }
}
