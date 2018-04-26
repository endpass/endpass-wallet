<template>
  <div class="send-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Send ETH</h1>
      </div>
    </div>

    <div class="section">
      <form id="sendEther" @submit="sendTransaction">
        <div class="field">
          <label class="label" for="address">To</label>
          <div class="control">
            <input v-model="transaction.to" @change="validateTo(); dirty.to = true;" type="text" class="input" id="address" aria-describedby="privateKey" placeholder="Receiver address" required>
          </div>
          <p class="help is-danger" v-show="dirty.to" v-for="err in activeErrors.to">{{err.message}}</p>
        </div>
        <div class="field">
          <label class="label" for="value">Amount</label>
          <div class="control">
            <input v-model="value" @change="validateValue(); dirty.value = true;" type="text" class="input" id="value" aria-describedby="privateKey" placeholder="Amount" required>
          </div>
          <p class="help is-danger" v-show="dirty.value" v-for="err in activeErrors.value">{{err.message}}</p>
        </div>
        <div class="field">
          <label class="label" for="gasPrice">Gas price</label>
          <div class="control">
            <input v-model="gasPrice" @change="validateGasPrice(); dirty.gasPrice = true;" type="text" class="input" id="gasPrice" aria-describedby="privateKey" placeholder="Gas price" required>
          </div>
          <p class="help is-danger" v-show="dirty.gasPrice" v-for="err in activeErrors.gasPrice">{{err.message}}</p>
        </div>
        <div class="field">
          <label class="label" for="gasLimit">Gas limit</label>
          <div class="control">
            <input v-model="gasLimit" @change="validateGasLimit(); dirty.gasLimit = true;" type="text" class="input" id="gasLimit" aria-describedby="privateKey" placeholder="Gas limit" required>
          </div>
          <p class="help is-danger" v-show="dirty.gasLimit" v-for="err in activeErrors.gasLimit">{{err.message}}</p>
        </div>
        <button :disabled="!validForm" class="button is-primary" @click="sendTransaction">Add</button>
      </form>
    </div>
  </div>
</template>

<script>

import web3 from 'web3';
import Tx from 'ethereumjs-tx';

export default {

  data () {
    return {
<<<<<<< HEAD
      validForm:false,
=======
      validForm: false,
>>>>>>> master
      transaction: {
        gasPrice: '0x14f46b0400',
        gasLimit: '0x55f0',
        to: '',
        value: '0x0',
        data: '0x0'
      },
      activeErrors: {
        gasPrice: [],
        gasLimit: [],
        to: [],
        value: []
      },
      dirty: {
        gasPrice: false,
        gasLimit: false,
        to: false,
        value: false
      }
    }
  },
  computed : {
    gasPrice: {
      get: function () {
        return web3.utils.fromWei(web3.utils.hexToNumberString(this.transaction.gasPrice), 'Gwei');
      },
      set: function (newValue) {
        if(isNaN(parseFloat(newValue,10)))
          return
        this.transaction.gasPrice = web3.utils.numberToHex(web3.utils.toWei(newValue, 'Gwei'));
      }
    },
    gasLimit: {
      get: function () {
        return web3.utils.hexToNumberString(this.transaction.gasLimit);
      },
      set: function (newValue) {
        if(isNaN(parseFloat(newValue,10)))
          return
        this.transaction.gasLimit = web3.utils.numberToHex(newValue);
      }
    },
    value: {
      get: function () {
        return web3.utils.fromWei(web3.utils.hexToNumberString(this.transaction.value));
      },
      set: function (newValue) {
        if(isNaN(parseFloat(newValue,10)))
          return
        this.transaction.value = web3.utils.numberToHex(web3.utils.toWei(newValue, 'ether'));
      }
    },
    message: {
      get: function () {
        return web3.utils.hexToUtf8(this.transaction.message);
      },
      set: function (newValue) {
        this.transaction.message = web3.utils.utf8ToHex(newValue);
      }
    }
  },
  watch: {
    activeErrors: {
      handler() {
        this.validForm = !this.activeErrors.value.length &&
        !this.activeErrors.to.length &&
        !this.activeErrors.gasLimit.length &&
        !this.activeErrors.gasPrice.length;
      },
      deep: true
    }
  },
  methods: {
    validateTo() {
      const newErrArray = [];
      if(this.transaction.to === '') {
        newErrArray.push({
          message: 'This field is required',
          type: 'required'
        });
      }
      if(!web3.utils.isAddress(this.transaction.to)) {
        newErrArray.push({
          message: 'This is not a valid address',
          type: 'invalid'
        });
      }
      let zeroAddressRegex = /^0x0+$/;
      if(web3.utils.isAddress(this.transaction.to) && this.transaction.to.match(zeroAddressRegex)) {
        newErrArray.push({
          message: 'You cant sent ether to zero address',
          type: 'zeroAdress'
        });
      }
      this.$set(this.activeErrors, 'to', newErrArray);
    },
    validateGasLimit() {
      const newErrArray = [];
      this.activeErrors.gasLimit = newErrArray;
      if(this.transaction.gasLimit === '') {
        newErrArray.push({
          message: 'This field is required',
          type: 'required'
        });
      }
      this.$set(this.activeErrors, 'gasLimit', newErrArray);
    },
    validateGasPrice() {
      const newErrArray = [];
      this.activeErrors.gasPrice = newErrArray;
      if(this.transaction.gasPrice === '') {
        newErrArray.push({
          message: 'This field is required',
          type: 'required'
        });
      }
      this.$set(this.activeErrors, 'gasPrice', newErrArray);
    },
    validateValue() {
      const newErrArray = [];
      if(this.transaction.value === '') {
        newErrArray.push({
          message: 'This field is required',
          type: 'required'
        });
      }
      this.$set(this.activeErrors, 'value', newErrArray);
    },
    chreateTransactionHistory(trx) {
      let historyItem = {};
      historyItem.to = trx.to;
      historyItem.value = trx.value;
      return historyItem;
    },
    sendTransaction(e) {
      let keyHex = this.$store.state.accounts.activeAccount.getAddressString();
      this.$store.state.web3.web3.eth.getTransactionCount(keyHex).then((nonce) => {
        let nonceWithPending = nonce + this.$store.state.accounts.pendingTransactions.length;
        this.transaction.nonce = web3.utils.numberToHex(nonceWithPending);
        let tx = new Tx(this.transaction);
        tx.sign(this.$store.state.accounts.activeAccount.getPrivateKey());
        var serializedTx = tx.serialize();
        let transactionForHistory = this.chreateTransactionHistory(this.transaction);
        this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', (resp) => {
          this.$store.commit('accounts/removeTransaction', resp.transactionHash);
        })
        .on('error', (err) => {
          console.log(err)
        })
        .on('transactionHash', (hash) => {
          transactionForHistory.hash = hash;
          this.$store.commit('accounts/addTransaction', transactionForHistory);
        });
      });
      e.preventDefault();
    }
  },
  created() {
    this.validateTo();
    this.validateGasLimit();
    this.validateGasPrice();
    this.validateValue();
  }
}
</script>

<style lang="scss">
</style>
