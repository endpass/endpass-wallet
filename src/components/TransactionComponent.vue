<template lang="html">
  <div class="box">
    <div class="columns">
      <div class="column is-9">
        <h2 class="subtitle">
          <span v-if="date">{{date}}</span>
          <span v-if="transaction.canseled">Canseled</span>
          <span v-if="!date && !transaction.canseled">Pending transaction</span>
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
            <span class="icon is-medium"
              v-html="require('@/img/loop.svg')"></span>
          </button>
          <button class="button is-small is-danger" @click="cansel" type="button" name="button">
            <span class="icon is-medium"
                  v-html="require('@/img/ban.svg')"></span>
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
