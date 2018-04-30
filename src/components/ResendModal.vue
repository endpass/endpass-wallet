<template lang="html">
  <div class="section">
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
  </div>
</template>

<script>
import web3 from 'web3'

export default {
  props: ['transaction'],
  data() {
    return {
      validForm: false,
      newTransaction: {
        gasPrice: null,
        gasLimit: null
      },
      activeErrors: {
        gasPrice: [],
        gasLimit: []
      },
      dirty: {
        gasPrice: false,
        gasLimit: false
      }
    }
  },
  computed : {
    gasPrice: {
      get: function () {
        return web3.utils.fromWei(web3.utils.hexToNumberString(this.newTransaction.gasPrice || this.transaction.gasPrice), 'Gwei');
      },
      set: function (newValue) {
        if(isNaN(parseFloat(newValue,10)))
          return
        if(this.gasPrice > newValue)
          return
        this.newTransaction.gasPrice = web3.utils.numberToHex(web3.utils.toWei(newValue, 'Gwei'));
      }
    },
    gasLimit: {
      get: function () {
        console.log(this.newTransaction.gasLimit,'lim')
        return web3.utils.hexToNumberString(this.newTransaction.gasLimit || this.transaction.gasLimit);
      },
      set: function (newValue) {
        if(isNaN(parseFloat(newValue,10)))
          return
        this.newTransaction.gasLimit = web3.utils.numberToHex(newValue);
      }
    }
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

    }
  },
  created() {
    this.newTransaction.gasLimit = this.transaction.gasLimit;
    this.newTransaction.gasPrice = this.transaction.gasPrice;
  }
}
</script>

<style lang="css">
</style>
