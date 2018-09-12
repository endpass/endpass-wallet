<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <v-form
        id="sendEther"
        @submit="confirmResend">
        <v-input
          id="gasPrice"
          v-model="newTransaction.gasPrice"
          :validator="`required|numeric|integer|between:${transaction.gasPrice},100`"
          label="Gas price"
          name="gasPrice"
          type="number"
          aria-describedby="gasPrice"
          placeholder="Gas price"
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
          :validator="`required|numeric|integer|between:${transaction.gasLimit},4000000`"
          label="Gas limit"
          name="gasLimit"
          type="number"
          aria-describedby="gasLimit"
          placeholder="Gas limit"
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
        >
          Send
        </v-button>
      </div>
    </v-modal>
  </div>
</template>

<script>
import web3 from 'web3';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import { Transaction } from '@/class';

export default {
  name: 'resend-modal',
  props: ['transaction'],
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
