<template>
  <div class="app-page receive-page">
    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h2 class="card-header-title">Receive ETH</h2>
          </div>
          <div class="card-content">
            <p>Your Wallet Address:</p>
            <p class="code address is-size-5">{{address}}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h2 class="card-header-title">Incoming Payment History</h2>
          </div>
          <div class="card-content">
            <ul class="transactions" v-if="processedTransactions.length">
              <li v-for="transaction in processedTransactions"
                :key="transaction.hash">
                <app-transaction :transaction="transaction"></app-transaction>
              </li>
            </ul>
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
import accounts from '@/mixins/accounts';

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
    }),
    processedTransactions() {
      return this.transactions.sort((trx1, trx2) => {
        return trx2.timestamp - trx1.timestamp;
      });
    },
  },
  created() {
    EthplorerService.getInfo(this.address)
      .then(resp => {
        this.transactions = resp.data.filter(trx => {
          return trx.to === this.address;
        });
        this.$store.dispatch('connectionStatus/updateApiErrorStatus', {
          id: 'ethplorer',
          status: true,
        });
      })
      .catch(e => {
        this.$notify({
          title: 'Failed to get transaction information',
          text:
            'An error occurred while retrieving transaction information. Please try again.',
          type: 'is-warning',
        });
        e.apiError = {
          id: 'ethplorer',
          status: false,
        };
        this.$store.dispatch('errors/emitError', e, { root: true });
        console.error(e);
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
