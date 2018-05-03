<template lang="html">
  <div class="transaction" :class="'is-'+statusText">
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">{{transaction.hash}}</p>
      </div>
      <div class="card-content">
        <p v-if="date" class="date">{{date}}</p>
        <p class="status">{{statusText}}</p>
        <p>
          <span v-if="recieve">From:</span>
          <span v-else>To: </span>

          <span v-if="recieve">{{transaction.from}}</span>
          <span v-else>To: {{transaction.to}}</span>
        </p>
      </div>
      <div v-if="isPending" class="card-footer">
        <a class="card-footer-item" @click="resend">
          <span class="icon is-medium"
                v-html="require('@/img/loop.svg')"></span>Resend
        </a>
        <a class="card-footer-item has-text-danger" @click="cansel" type="button" name="button">
          <span class="icon is-medium"
                v-html="require('@/img/ban.svg')"></span>Cancel
        </a>
      </div>
    </div>

    <resend-modal :transaction="transaction" v-if="resendModalOpen" @close="closeResendModal"/>
  </div>
</template>

<script>
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import ResendModal from './ResendModal';

window.web3 = web3
export default {
  props: ['transaction'],
  data () {
    return {
      resendModalOpen: false
    }
  },
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
    },
    isPending () {
      return !this.date && !this.transaction.canseled
    },
    statusText () {
      if (this.transaction.canseled) {
        return 'cancelled'
      } else if (this.isPending) {
        return 'pending'
      } else {
        return 'confirmed'
      }
    }
  },
  methods: {
    resend() {
      this.resendModalOpen = true
    },
    closeResendModal() {
      this.resendModalOpen = false
    },
    cansel() {
      if(this.transaction.date)
        return;
      const canselTransaction = {};
      Object.assign(canselTransaction, this.transaction);
      canselTransaction.value = web3.utils.numberToHex('0');
      canselTransaction.to = this.$store.state.accounts.activeAccount.getAddressString();
      let initialGwei = parseInt(web3.utils.fromWei(web3.utils.hexToNumberString(canselTransaction.gasPrice), 'Gwei'), 10);
      canselTransaction.gasPrice = web3.utils.numberToHex(web3.utils.toWei((initialGwei + 1).toString(),'Gwei'));
      canselTransaction.gasLimit = canselTransaction.gasLimit;
      delete canselTransaction.hash
      let tx = new Tx(canselTransaction);
      tx.sign(this.$store.state.accounts.activeAccount.getPrivateKey());
      var serializedTx = tx.serialize();
      this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('transactionHash', (hash) => {
        this.$store.commit('accounts/canselTransaction', this.transaction.hash);
      });
    }
  },
  updated () {
    console.log(this.transaction)
  },
  components: {
    ResendModal
  }
}
</script>

<style lang="css">
</style>
