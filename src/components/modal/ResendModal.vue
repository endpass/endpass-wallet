<template lang="html">
  <div
    class="new-account-modal"
    data-test="resend-modal"
  >
    <v-modal @close="close">
      <v-form
        id="sendEther"
        :is-form-valid="isFormValid"
        @submit="confirmResend"
      >
        <v-input
          id="gasPrice"
          v-model="newTransaction.gasPrice"
          v-validate="`required|numeric|integer|between:${minimumGasPrice},100`"
          :error="errors.first('gasPrice')"
          :label="$t('components.resendModal.gasPrice')"
          name="gasPrice"
          data-vv-name="gasPrice"
          type="number"
          aria-describedby="gasPrice"
          :placeholder="$t('components.resendModal.gasPrice')"
          data-test="gas-price-input"
          autofocus
          required
        >
          <div
            slot="addon"
            class="control"
          >
            <a class="button is-static">{{$t('global.gwei')}}</a>
          </div>
        </v-input>
        <v-input
          id="gasLimit"
          v-model="newTransaction.gasLimit"
          v-validate="
            `required|numeric|integer|between:${transaction.gasLimit},1000000`
          "
          :error="errors.first('gasLimit')"
          :label="$t('components.resendModal.gasLimit')"
          name="gasLimit"
          data-vv-name="gasLimit"
          type="number"
          aria-describedby="gasLimit"
          :placeholder="$t('components.resendModal.gasLimit')"
          data-test="gas-limit-input"
          required
        />
      </v-form>
      <div
        slot="footer"
        class="buttons"
      >
        <v-button
          :disabled="!isFormValid"
          form="sendEther"
          class-name="is-primary is-medium"
          data-test="submit-button"
        >
          {{$t('global.send')}}
        </v-button>
      </div>
    </v-modal>
  </div>
</template>

<script>
import formMixin from '@/mixins/form';
import { Transaction } from '@/class';

export default {
  name: 'ResendModal',

  props: {
    transaction: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      newTransaction: null,
    };
  },
  computed: {
    minimumGasPrice() {
      return Math.floor(Number(this.transaction.gasPrice) + 1);
    },
  },
  methods: {
    confirmResend() {
      this.$emit('confirm', this.newTransaction);
    },
    close() {
      this.$emit('close');
    },
  },
  created() {
    this.newTransaction = {
      ...Transaction.clone(this.transaction),
      gasPrice: this.minimumGasPrice,
    };
  },
  mixins: [formMixin],
};
</script>

<style lang="css"></style>
