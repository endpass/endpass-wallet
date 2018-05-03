<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Transaction history</h1>
        <ul class="transactions">
          <li v-for="transaction in processedTransactions"
          :key="transaction.hash">
            <app-transaction :transaction="transaction"></app-transaction>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import appTransaction from './TransactionComponent'
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
    }
  },
  created() {
    const address = this.$store.state.accounts.activeAccount.getAddressString();
    this.$http.get(`https://api.ethplorer.io/getAddressTransactions/${address}`, {
      params: {
        limit: 50,
        apiKey: 'freekey'
      }
    }).then((resp) => {
      this.transactions = resp.body;
    })
  },
  components: {
    appTransaction
  }
}
</script>

<style lang="scss">
  .transactions {
      max-width: 700px;
  }
</style>
