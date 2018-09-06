<template>
  <v-form @submit="recoverTransaction">
    <v-textarea
      v-model="transactionHash"
      label="RLP encoded transaction"
    />
    <v-button
      :disabled="!transactionHash"
      class-name="is-primary is-medium"
    >
      Recover transaction
    </v-button>
    <v-textarea
      v-if="recoveredTransaction"
      v-model="recoveredTransactionString"
      label="Recovered transaction"
      disabled
    />
  </v-form>
</template>

<script>
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VTextarea from '@/components/ui/form/VTextarea.vue';
import { recoverTransaction } from '@/utils/transactions';

export default {
  name: 'recover-transaction',

  components: {
    VForm,
    VButton,
    VTextarea,
  },

  data: () => ({
    transactionHash: null,
    recoveredTransaction: null,
  }),

  computed: {
    recoveredTransactionString() {
      return JSON.stringify(this.recoveredTransaction);
    },
  },

  methods: {
    async recoverTransaction() {
      try {
        this.recoveredTransaction = recoverTransaction(this.transactionHash);
      } catch (error) {
        this.recoveredTransaction = null;
        this.$notify({
          title: 'Error while recovering the transaction',
          text:
            'An error occurred while recovering the transaction. Please try again.',
          type: 'is-danger',
        });
        console.error(error);
      }
    },
  },
};
</script>
