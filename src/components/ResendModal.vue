<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <div class="field">
        <label class="label" for="gasPrice">Gas price</label>
        <div class="control">
          <input
            v-model.number="newTransaction.gasPrice"
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
            v-model.number="newTransaction.gasLimit"
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
    </v-modal>
  </div>
</template>

<script>
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import VModal from '@/components/ui/VModal'
import accounts from '@/mixins/accounts';
import { Transaction } from '@/class';
import { mapState, mapMutations } from 'vuex';

export default {
  props: ['transaction'],
  data() {
    return {
      newTransaction: this.transaction.clone(),
    }
  },
  computed: {
    ...mapState({
      web3: state => state.web3.web3,
    }),
    isFormValid() {
      const hasInvalidField = Object.keys(this.fields).some(
        field => this.fields[field] && this.fields[field].invalid
      );
      return !(hasInvalidField || this.errors.count());
    },
  },
  methods: {
    ...mapMutations('accounts', ['removeTransaction', 'addTransaction']),
    submit() {
      let web3Transaction = this.newTransaction.getApiObject(this.web3.eth);
      let tx = new Tx(web3Transaction);
      tx.sign(this.activeAccount.getPrivateKey());
      var serializedTx = tx.serialize();
      this.web3.eth
        .sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', resp => {
          this.removeTransaction(resp.transactionHash);
        })
        .on('error', err => {})
        .on('transactionHash', hash => {
          this.newTransaction.hash = hash;
          this.removeTransaction(this.transaction.hash);
          this.addTransaction(this.newTransaction);
        });
      this.$emit('close');
    },
    close() {
      this.$emit('close');
    },
  },
  mixins: [accounts],
  components: {
    VModal
  }
};
</script>

<style lang="css">
</style>
