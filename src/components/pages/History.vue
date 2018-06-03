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
import appTransaction from './TransactionComponent'
import appTransaction from '@/components/TransactionComponent'
import EthplorerService from '@/services/ethplorer'
import accounts from '@/mixins/accounts'

export default {
  data () {
    return {
      transactions: []
    }
  },
  computed: {
    processedTransactions() {
      const fullTransactions = this.transactions.concat(this.$store.state.accounts.pendingTransactions);
      return fullTransactions.sort((trx1, trx2) => {
        if(typeof trx2.timestamp === 'undefined')
          return 1
        if(typeof trx1.timestamp === 'undefined')
          return -1
        return trx2.timestamp - trx1.timestamp;
      });
    },
    // Whether history is supported on this network
    historyAvailable () {
      let activeNet = this.$store.state.web3.activeNet.name
      return activeNet === 'Main'
    }
  },
  created() {
    const historyPromise = EthplorerService.getHistory(this.address);
    const transactionsPromise = EthplorerService.getInfo(this.address);
  
    Promise.all([transactionsPromise, historyPromise])
      .then(values => {
        this.transactions = values[0].data.concat(values[1].data.operations);
      })
      .catch(e => {
        this.$notify({
          title: 'Failed to get transaction information',
          text:
            'An error occurred while retrieving transaction information. Please try again.',
          type: 'is-warning',
        });
        console.error(e);
      });
  },
  components: {
    appTransaction
  },
  mixins: [accounts]
}
</script>

<style lang="scss">
  .transactions {
      max-width: 700px;
  }
</style>
