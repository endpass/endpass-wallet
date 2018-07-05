<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <v-form id="sendEther">
        <v-input v-model="transaction.gasPrice"
                 label="Gas price"
                 name="gasPrice"
                 type="number"
                 validator="required|numeric|integer|between:0,100"
                 id="gasPrice"
                 aria-describedby="gasPrice"
                 placeholder="Gas price"
                 :disabled="isSending"
                 required>
          <div class="control" slot="addon">
            <a class="button is-static">Gwei</a>
          </div>
        </v-input>
        <v-input v-model="transaction.gasLimit"
                 label="Gas limit"
                 name="gasLimit"
                 type="number"
                 validator="required|numeric|integer|between:21000,4000000"
                 id="gasLimit"
                 aria-describedby="gasLimit"
                 placeholder="Gas limit"
                 :disabled="isSending"
                 required />

        <v-button @click.prevent="confirmResend"
                  className="is-primary is-medium">Send</v-button>
      </v-form>
    </v-modal>
  </div>
</template>

<script>
import web3 from 'web3';
import VModal from '@/components/ui/VModal'
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import { Transaction } from '@/class';

export default {
  props: ['transaction'],
  data() {
    return {
      newTransaction: new Transaction (this.transaction)
    }
  },
  methods: {
    confirmResend() {
      this.$emit('confirm', this.transaction);
    },
    close() {
      this.$emit('closeResendModal');
    },
  },
  created() {
    this.transaction = this.transaction.clone();
  },
  components: {
    VModal,
    VForm,
    VInput,
    VButton
  }
};
</script>

<style lang="css">
</style>
