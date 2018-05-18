<template lang="html">
  <div class="section">
    <button class="button is-small is-danger is-pulled-right" @click="cansel" type="button" name="button">
      <span class="icon is-medium">
        <i class="fa fa-times"></i>
      </span>
    </button>
    <div class="field">
      <label class="label" for="gasPrice">Gas price</label>
      <div class="control">
        <input v-model.number="gasPrice" type="text" class="input" id="gasPrice" aria-describedby="gasPrice" placeholder="Gas price" required>
      </div>
      <p class="help is-danger" v-show="dirty.gasPrice" v-for="err in activeErrors.gasPrice">{{err.message}}</p>
    </div>
    <div class="field">
      <label class="label" for="gasLimit">Gas limit</label>
      <div class="control">
        <input v-model.number="gasLimit" type="text" class="input" id="gasLimit" aria-describedby="gasLimit" placeholder="Gas limit" required>
      </div>
    </div>
    <button class="button is-primary" @click="submit">Add</button>
  </div>
</template>

<script>
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import accounts from '@/mixins/accounts'

export default {
  props: ['transaction'],
  data() {
    return {
      validForm: false,
      newTransaction: {
        gasPrice: null,
        gasLimit: null,
      },
      activeErrors: {
        gasPrice: [],
        gasLimit: [],
      },
      dirty: {
        gasPrice: false,
        gasLimit: false,
      }
    }
  },
  computed : {
    gasPrice: {
      get: function () {
        return web3.utils.fromWei(web3.utils.hexToNumberString(this.newTransaction.gasPrice || this.transaction.gasPrice), 'Gwei');
      },
      set: function (newValue) {
        if(typeof newValue !== 'number')
          return
        if(this.gasPrice > newValue)
          return
        this.newTransaction.gasPrice = web3.utils.numberToHex(web3.utils.toWei(newValue.toString(), 'Gwei'));
      }
    },
    gasLimit: {
      get: function () {
        return web3.utils.hexToNumberString(this.newTransaction.gasLimit || this.transaction.gasLimit);
      },
      set: function (newValue) {
        if(typeof newValue !== 'number')
          return
        this.newTransaction.gasLimit = web3.utils.numberToHex(newValue.toString());
      }
    },
  },
  methods: {
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
    submit() {
      let sendTrx = Object.assign({}, this.transaction, this.newTransaction);
      let tx = new Tx(sendTrx);
      tx.sign(this.activeAccount.getPrivateKey());
      var serializedTx = tx.serialize();
      this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('receipt', (resp) => {
        this.$store.commit('accounts/removeTransaction', resp.transactionHash);
      })
      .on('error', (err) => {
      })
      .on('transactionHash', (hash) => {
        let storeTrx = {};
        storeTrx.hash = hash;
        storeTrx.gasLimit = web3.utils.hexToNumberString(this.newTransaction.gasLimit);
        storeTrx.gasPrice = web3.utils.hexToNumberString(this.newTransaction.gasPrice);
        this.$store.commit('accounts/updateTransaction', {
          oldHash: this.transaction.hash,
          newTrx: storeTrx
        });
      });
      this.$emit('close');
    },
    cansel() {
      this.$emit('close');
    }
  },
  created() {
    this.newTransaction.gasLimit = this.transaction.gasLimit;
    this.newTransaction.gasPrice = this.transaction.gasPrice;
  },
  mixins: [accounts]
}
</script>

<style lang="css">
</style>
