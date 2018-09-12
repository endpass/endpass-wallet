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
              v-if="currentNetTransactions.length"
              class="transactions"
            >
              <li
                v-for="transaction in currentNetTransactions"
                :key="transaction.hash"
              >
                <app-transaction :transaction="transaction" />
              </li>
            </ul>
            <p v-else-if="!isHistoryAvailable">Transaction history is only supported on the main network.</p>
            <v-spinner
              v-else-if="isLoading"
              :is-loading="isLoading"
            />
            <p v-else>This account has no transactions.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import VSpinner from '@/components/ui/VSpinner';
import appTransaction from '@/components/Transaction';
import { MAIN_NET_ID } from '@/constants';

export default {
  data() {
    return {
      isLoading: true,
    };
  },
  computed: {
    ...mapState({
      address: state =>
        state.accounts.address &&
        state.accounts.address.getChecksumAddressString(),
      activeNet: state => state.web3.activeNet,
    }),
    ...mapGetters('transactions', ['currentNetTransactions']),
    // Whether history is supported on this network
    isHistoryAvailable() {
      return this.activeNet.id === MAIN_NET_ID;
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
  created() {
    this.$watch(vm => [vm.activeNet.id, vm.address].join(), this.getHistory, {
      immediate: true,
    });
  },
  components: {
    appTransaction,
    VSpinner,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
</style>
