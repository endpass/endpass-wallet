<template lang="html">
  <div
    class="new-account-modal"
    data-test="resend-modal"
  >
    <v-modal @close="close">
      <v-form
        id="sendEther"
        @submit="confirmResend"
      >
        <v-input
          id="gasPrice"
          v-model="newTransaction.gasPrice"
          :validator="`required|numeric|integer|between:${transaction.gasPrice},100`"
          label="Gas price"
          name="gasPrice"
          type="number"
          aria-describedby="gasPrice"
          placeholder="Gas price"
          data-test="gas-price-input"
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
          :validator="`required|numeric|integer|between:${transaction.gasLimit},1000000`"
          label="Gas limit"
          name="gasLimit"
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
