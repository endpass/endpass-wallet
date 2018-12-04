<template lang="html">
  <div
    class="new-account-modal"
    data-test="resend-modal"
  >
    <v-modal @close="close">
      <v-form
        id="sendEther"
        @submit="confirmResend"
        :isFormValid="isFormValid"
        >
        <v-input
          id="gasPrice"
          v-model="newTransaction.gasPrice"
          label="Gas price"
          name="gasPrice"
          data-vv-name="gasPrice"
          type="number"
          aria-describedby="gasPrice"
          placeholder="Gas price"
          data-test="gas-price-input"
          v-validate="`required|numeric|integer|between:${transaction.gasPrice},100`"
          :error="errors.first('gasPrice')"
          autofocus
          required
        >
          <div
            slot="addon"
            class="control"
          >
            <a class="button is-static">Gwei</a>
          </div>
        </v-input>
        <v-input
          id="gasLimit"
          v-model="newTransaction.gasLimit"
          v-validate="`required|numeric|integer|between:${transaction.gasLimit},1000000`"
          :error="errors.first('gasLimit')"
          label="Gas limit"
          name="gasLimit"
          data-vv-name="gasLimit"
          type="number"
          aria-describedby="gasLimit"
          placeholder="Gas limit"
          data-test="gas-limit-input"
          required
        />

      </v-form>
      <div
        slot="footer"
        class="buttons"
      >
        <v-button
          form="sendEther"
          class-name="is-primary is-medium"
          data-test="submit-button"
          :disabled="!isFormValid"
        >
          Send
        </v-button>
      </div>
    </v-modal>
  </div>
</template>

<script>
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import formMixin from '@/mixins/form';

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
  methods: {
    confirmResend() {
      this.$emit('confirm', this.newTransaction);
    },
    close() {
      this.$emit('close');
    },
  },
  created() {
    this.newTransaction = this.transaction.clone();
  },
  mixins: [formMixin],
  components: {
    VModal,
    VForm,
    VInput,
    VButton,
  },
};
</script>

<style lang="css">
</style>
