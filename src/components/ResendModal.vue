<template lang="html">
  <div class="section">
    <button class="button is-small is-danger is-pulled-right" @click="cancel" type="button" name="button">
      <span class="icon is-medium">
        <i class="fa fa-times"></i>
      </span>
    </button>
    <div class="field">
      <label class="label" for="gasPrice">Gas price</label>
      <div class="control">
        <input
          v-model.number="gasPrice"
          type="text"
          class="input"
          :class="{'is-danger': errors.has('gasPrice') }"
          id="gasPrice"
          name="gasPrice"
          v-validate="'required|integer|min_value:1'"
          data-vv-as="gas price"
          aria-describedby="gasPrice"
          placeholder="Gas price"
          required>
      </div>
      <p class="help is-danger"
        v-show="errors.has('gasPrice')">{{ errors.first('gasPrice') }}</p>
    </div>
    <div class="field">
      <label class="label" for="gasLimit">Gas limit</label>
      <div class="control">
        <input
          v-model.number="gasLimit"
          type="text"
          class="input"
          :class="{'is-danger': errors.has('gasLimit') }"
          id="gasLimit"
          name="gasLimit"
          v-validate="'required|integer|min_value:21000'"
          data-vv-as="gas limit"
          aria-describedby="gasLimit"
          placeholder="Gas limit"
          required>
      </div>
      <p class="help is-danger"
        v-show="errors.has('gasLimit')">{{ errors.first('gasLimit') }}</p>
    </div>
    <button
      class="button is-primary"
      @click="submit"
      :disabled="!isFormValid">Add</button>
  </div>
</template>

<script>
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import accounts from '@/mixins/accounts';
import { mapState, mapMutations } from 'vuex';

const {
  fromWei,
  hexToNumber,
  hexToNumberString,
  numberToHex,
  toWei,
} = web3.utils;

export default {
  props: ['transaction'],
  data: () => ({
    newTransaction: {
      gasPrice: null,
      gasLimit: null,
    },
  }),
  computed: {
    ...mapState({
      web3: state => state.web3.web3,
    }),
    gasPrice: {
      get() {
        return fromWei(
          hexToNumberString(
            this.newTransaction.gasPrice || this.transaction.gasPrice
          ),
          'Gwei'
        );
      },
      set(newValue) {
        const transValueFromHex = fromWei(
          hexToNumberString(this.transaction.gasPrice),
          'Gwei'
        );

        if (newValue >= transValueFromHex) {
          this.errors.remove('gasPrice');
        } else if (
          newValue < transValueFromHex &&
          !this.errors.has('gasPrice')
        ) {
          this.errors.add({
            field: 'gasPrice',
            msg: 'Gas price must be greater than transaction gas price',
            id: 'wrongGasPrice',
            rule: 'wrongGasPrice',
          });
        }

        if (typeof newValue === 'number') {
          this.newTransaction.gasPrice = numberToHex(
            toWei(newValue.toString(), 'Gwei')
          );
        }
      },
    },
    gasLimit: {
      get() {
        return hexToNumberString(
          this.newTransaction.gasLimit || this.transaction.gasLimit
        );
      },
      set(newValue) {
        const transValueFromHex = hexToNumber(this.transaction.gasLimit);

        if (newValue >= transValueFromHex) {
          this.errors.remove('gasLimit');
        } else if (
          newValue < transValueFromHex &&
          !this.errors.has('gasLimit')
        ) {
          this.errors.add({
            field: 'gasLimit',
            msg: 'Gas limit must be greater than transaction gas limit',
          });
        }

        if (typeof newValue === 'number') {
          this.newTransaction.gasLimit = numberToHex(newValue.toString());
        }
      },
    },
    isFormValid() {
      const hasInvalidField = Object.keys(this.fields).some(
        field => this.fields[field] && this.fields[field].invalid
      );

      return !(hasInvalidField || this.errors.count());
    },
  },
  methods: {
    ...mapMutations('accounts', ['removeTransaction', 'updateTransaction']),
    submit() {
      let sendTrx = Object.assign({}, this.transaction, this.newTransaction);
      let tx = new Tx(sendTrx);
      tx.sign(this.activeAccount.getPrivateKey());
      var serializedTx = tx.serialize();
      this.web3.eth
        .sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', resp => {
          this.removeTransaction(resp.transactionHash);
        })
        .on('error', err => {})
        .on('transactionHash', hash => {
          let storeTrx = {};
          storeTrx.hash = hash;
          storeTrx.gasLimit = hexToNumberString(this.newTransaction.gasLimit);
          storeTrx.gasPrice = hexToNumberString(this.newTransaction.gasPrice);
          this.updateTransaction({
            oldHash: this.transaction.hash,
            newTrx: storeTrx,
          });
        });
      this.$emit('close');
    },
    cancel() {
      this.$emit('close');
    },
  },
  created() {
    this.newTransaction.gasLimit = this.transaction.gasLimit;
    this.newTransaction.gasPrice = this.transaction.gasPrice;
  },
  mixins: [accounts],
};
</script>

<style lang="css">
</style>
