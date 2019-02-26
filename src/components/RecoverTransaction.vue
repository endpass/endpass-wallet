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
import { toChecksumAddress } from 'web3-utils';

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
          to: toChecksumAddress(decodedTransaction.to),
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
};
</script>
