<template>
  <div class="send-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Send ETH</h1>
      </div>
    </div>

    <div class="section">
      <form>
        <div class="field">
          <label class="label" for="privateKey">To</label>
          <div class="control">
            <input v-model="transaction.to" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Receiver address">
          </div>
        </div>
        <div class="field">
          <label class="label" for="privateKey">Amount</label>
          <div class="control">
            <input v-model="value" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Amount">
          </div>
        </div>
        <div class="field">
          <label class="label" for="privateKey">Gas price</label>
          <div class="control">
            <input v-model="gasPrice" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Gas price">
          </div>
        </div>
        <div class="field">
          <label class="label" for="privateKey">Gas limit</label>
          <div class="control">
            <input v-model="gasLimit" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Gas limit">
          </div>
        </div>
        <button class="button is-primary" @click="sendTransaction">Add</button>
      </form>
    </div>
  </div>
</template>

<script>

import web3 from 'web3';
import Tx from 'ethereumjs-tx';

export default {

  data () {

      window.web3 = web3;
    return {
      transaction: {
        gasPrice: '0x14f46b0400',
        gasLimit: '0x55f0',
        to: '',
        value: '0x0',
        data: '0x0'
      }
    }
  },
  computed : {
    gasPrice: {
      get: function () {
        return web3.utils.fromWei(web3.utils.hexToNumberString(this.transaction.gasPrice), 'Gwei');
      },
      set: function (newValue) {
        this.transaction.gasPrice = web3.utils.numberToHex(web3.utils.toWei(newValue, 'Gwei'));
      }
    },
    gasLimit: {
      get: function () {
        return web3.utils.hexToNumberString(this.transaction.gasLimit);
      },
      set: function (newValue) {
        this.transaction.gasLimit = web3.utils.numberToHex(newValue);
      }
    },
    value: {
      get: function () {
        return web3.utils.fromWei(web3.utils.hexToNumberString(this.transaction.value));
      },
      set: function (newValue) {
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
  methods: {
    sendTransaction() {
      let keyHex = this.$store.state.accounts.activeAccount.getAddressString();
      this.$store.state.web3.web3.eth.getTransactionCount(keyHex).then((nonce) => {
        this.transaction.nonce = web3.utils.numberToHex(nonce);
        console.log(this.transaction);
        let tx = new Tx(this.transaction);
        console.log(tx, 'signed');
        tx.sign(this.$store.state.accounts.activeAccount.getPrivateKey());
        var serializedTx = tx.serialize();
        this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', (resp) => {
          console.log(resp);
        })
        .on('error', (err) => {
          console.log(err)
        })
        .on('transactionHash', (err) => {
          console.log(err)
        })
        .on('confirmation', (err) => {
          console.log(err)
        })
      });
    }
  }
}
</script>

<style lang="scss">
</style>
