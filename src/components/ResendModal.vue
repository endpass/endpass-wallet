<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <v-form id="sendEther">
        <v-input v-model="newTransaction.gasPrice"
                 label="Gas price"
                 name="gasPrice"
                 type="number"
                 :validator="`required|numeric|integer|between:${transaction.gasPrice},100`"
                 id="gasPrice"
                 aria-describedby="gasPrice"
                 placeholder="Gas price"
                 required>
          <div class="control" slot="addon">
            <a class="button is-static">Gwei</a>
          </div>
        </v-input>
        <v-input v-model="newTransaction.gasLimit"
                 label="Gas limit"
                 name="gasLimit"
                 type="number"
                 :validator="`required|numeric|integer|between:${transaction.gasLimit},4000000`"
                 id="gasLimit"
                 aria-describedby="gasLimit"
                 placeholder="Gas limit"
                 required />

        <v-button @click.prevent="confirmResend"
                  className="is-primary is-medium">Send</v-button>
      </v-form>
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
