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
    <div
      v-if="recoveredTransaction"
      class="field"
    >
      <label class="label">Recovered transaction</label>
      <p class="code">
        {{ recoveredTransactionString }}
      </p>
    </div>
  </v-form>
</template>

<script>
import { decodeTx } from 'ethereum-tx-decoder';
import web3 from '@/utils/web3';
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VTextarea from '@/components/ui/form/VTextarea.vue';

export default {
  name: 'RecoverTransaction',

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
        const decodedTransaction = decodeTx(this.transactionHash);

        Object.assign(decodedTransaction, {
          to: web3.utils.toChecksumAddress(decodedTransaction.to),
        });

        this.recoveredTransaction = decodedTransaction;
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

  components: {
    VForm,
    VButton,
    VTextarea,
  },
};
</script>
