<template lang="html">
  <div class="box">
    <div class="columns">
      <div class="column is-9">
        <h2 class="subtitle">
          <span v-if="date">{{date}}</span>
          <span v-if="transaction.canseled">Canseled</span>
          <span v-else>Pending transaction</span>
        </h2>
        <p>
          <span v-if="recieve">From: </span>
          <span v-if="!recieve">To: </span>
          <span v-if="recieve">{{transaction.from}}</span>
          <span v-if="!recieve">To{{transaction.to}}</span>

        </p>
      </div>
      <div class="column is-3">
        <p v-if="!date && !transaction.canseled" class="has-text-right">
          <button class="button is-small is-warning" @click="resend" type="button" name="button">
            <span class="icon is-medium">
              <i class="fa fa-edit"></i>
            </span>
          </button>
          <button class="button is-small is-danger" @click="cansel" type="button" name="button">
            <span class="icon is-medium">
              <i class="fa fa-ban"></i>
            </span>
          </button>
        </p>
        <p class="has-text-right">{{transaction.value}} ETH</p>
        <p class="has-text-right" v-if="transaction.success">Succeeded</p>
        <p class="has-text-right" v-if="transaction.success">Failed</p>
      </div>
    </div>
    <div class="columns">
      <p class="column is-12">{{transaction.hash}}</p>
    </div>
  </div>
</template>

<script>
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import resendModal from './ResendModal';

export default {
  props: ['transaction'],
  computed: {
    recieve() {
      return this.transaction.to === this.$store.state.accounts.activeAccount.getAddressString();
    },
    date() {
      if(this.transaction.timestamp) {
        const date = new Date(this.transaction.timestamp*1000);
        return date.toLocaleString();
      } else {
        return false;
      }
    }
  },
  methods: {
    resend() {
      this.$on('resend', (newTrx) => {
        Object.assign({}, this.transaction, newTrx);
        canselTransaction.value = web3.utils.hexToNumberString('0');
        canselTransaction.to = this.$store.state.accounts.activeAccount.getAddressString();
        let tx = new Tx(canselTransaction);
        tx.sign(this.$store.state.accounts.activeAccount.getPrivateKey());
        var serializedTx = tx.serialize();
        this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', (resp) => {
          this.$store.commit('accounts/removeTransaction', resp.transactionHash);
        })
        .on('error', (err) => {
        })
        .on('transactionHash', (hash) => {
          transactionForHistory.hash = hash;
          this.$store.commit('accounts/addTransaction', transactionForHistory);
        });
      });
      this.$modal.show(resendModal, {
        transaction: this.transaction
      })
    },
    cansel() {
      if(this.transaction.date)
        return
      const canselTransaction = {};
      Object.assign(canselTransaction, this.transaction);
      canselTransaction.value = web3.utils.hexToNumberString('0');
      canselTransaction.to = this.$store.state.accounts.activeAccount.getAddressString();
      canselTransaction.gasPrice = web3.utils.numberToHex((web3.utils.hexToNumber(canselTransaction.gasPrice) + web3.utils.toWei(1, 'Gwei')).toString());
      canselTransaction.gasLimit = web3.utils.numberToHex(canselTransaction.gasLimit);
      let tx = new Tx(canselTransaction);
      tx.sign(this.$store.state.accounts.activeAccount.getPrivateKey());
      var serializedTx = tx.serialize();
      this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('transactionHash', (hash) => {
        this.$store.commit('accounts/canselTransaction', hash);
      });
    }
  }
}
</script>

<style lang="css">
</style>
