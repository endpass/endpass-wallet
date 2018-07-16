<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h1 class="card-header-title">Transaction history</h1>
          </div>
          <div class="card-content">
            <ul v-if="processedTransactions.length" class="transactions">
              <li v-for="transaction in processedTransactions"
              :key="transaction.hash">
                <app-transaction :transaction="transaction"></app-transaction>
              </li>
            </ul>
            <p v-else-if="!historyAvailable">Transaction history is only
            supported on the main network.</p>
            <p v-else>This account has no transactions.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import appTransaction from '@/components/Transaction';
import EthplorerService from '@/services/ethplorer';
import { Transaction } from '@/class';

export default {
  data() {
    return {
      transactions: [],
    };
  },
  computed: {
    ...mapState({
      address: state =>
        state.accounts.address && state.accounts.address.getAddressString(),
      pendingTransactions: state => state.transactions.pendingTransactions,
    }),
    processedTransactions() {
      const fullTransactions = this.transactions.concat(
        this.pendingTransactions,
      );
      return fullTransactions.sort((trx1, trx2) => {
        if (typeof trx2.timestamp === 'undefined') return 1;
        if (typeof trx1.timestamp === 'undefined') return -1;
        return trx2.timestamp - trx1.timestamp;
      });
    },
    // Whether history is supported on this network
    historyAvailable() {
      let activeNet = this.$store.state.web3.activeNet.name;
      return activeNet === 'Main';
    },
  },
  created() {
    const historyPromise = EthplorerService.getHistory(this.address);
    const transactionsPromise = EthplorerService.getInfo(this.address);

    Promise.all([transactionsPromise, historyPromise])
      .then(values => {
        this.transactions = values[0].data
          .concat(values[1].data.operations)
          .map(trx => new Transaction(trx));
        this.$store.dispatch(
          'connectionStatus/updateApiErrorStatus',
          {
            id: 'ethplorer',
            status: true,
          },
          { root: true },
        );
      })
      .catch(e => {
        this.$notify({
          title: 'Failed to get transaction information',
          text:
            'An error occurred while retrieving transaction information. Please try again.',
          type: 'is-warning',
        });
        console.error(e);
        e.apiError = {
          id: 'ethplorer',
          status: false,
        };
        this.$store.dispatch('errors/emitError', e, { root: true });
      });
  },
  components: {
    appTransaction,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
</style>
