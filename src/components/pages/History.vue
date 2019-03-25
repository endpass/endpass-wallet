<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h1 class="card-header-title">Transaction history</h1>
          </div>
          <div class="card-content">
            <ul
              v-if="currentNetTransactions.length > 0"
              class="transactions"
            >
              <li
                v-for="transaction in currentNetTransactions"
                :key="transaction.hash"
                data-test="transactions-history-item"
              >
                <app-transaction :transaction="transaction" />
              </li>
            </ul>
            <p v-else-if="!isHistoryAvailable">
              Transaction history is only supported on the main network.
            </p>
            <v-spinner v-else-if="isLoading" />
            <p v-else>This account has no transactions.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import appTransaction from '@/components/Transaction';
import { Network } from '@endpass/class';

export default {
  data: () => ({
    isLoading: true,
  }),

  computed: {
    ...mapState({
      address: state => state.accounts.address,
      activeNet: state => state.web3.activeNet,
    }),
    ...mapGetters('transactions', ['currentNetTransactions']),

    isHistoryAvailable() {
      return this.activeNet.id === Network.NET_ID.MAIN;
    },
  },

  watch: {
    async activeNet() {
      await this.getHistory();
    },

    async address() {
      await this.getHistory();
    },
  },

  methods: {
    ...mapActions('transactions', ['updateTransactionHistory']),

    async getHistory() {
      if (!(this.address && this.isHistoryAvailable)) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;
      await this.updateTransactionHistory();
      this.isLoading = false;
    },
  },

  async mounted() {
    await this.getHistory();
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
