<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Receive ETH</h1>
        <div class="box">
          <p>Your Wallet Address:</p>
          <p class="is-size-4">{{address}}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="">
          <h2 class="subtitle">Incoming Payment History</h2>
          <ul class="transactions">
            <li v-for="transaction in processedTransactions"
              :key="transaction.hash">
              <app-transaction :transaction="transaction"></app-transaction>
            </li>
          </ul>
        </div>
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
    address() {
      return this.$store.state.accounts.activeAccount.getAddressString()
    },
    processedTransactions() {
      return this.transactions.sort((trx1, trx2) => {
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
      this.transactions = resp.body.filter((trx) => {
        return trx.to === this.address;
      });
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
