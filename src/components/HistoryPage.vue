<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Transaction history</h1>
        <ul class="transactions">
          <li class="box" v-for="transaction in processedTransactions">
            <div class="columns">
              <div class="column is-9">
                <h2 class="subtitle">
                  <span v-if="transaction.timestamp">{{transaction.timestamp}}</span>
                  <span v-else>Pending transaction</span>
                </h2>
                <p>
                  <span v-if="transaction.recieve">From: </span>
                  <span v-if="!transaction.recieve">To: </span>
                  {{transaction.address}}
                </p>
              </div>
              <div class="column is-3">
                <p class="has-text-right">{{transaction.value}} ETH</p>
                <p class="has-text-right" v-if="transaction.timestamp && transaction.success">Succeeded</p>
                <p class="has-text-right" v-if="transaction.timestamp && !transaction.success">Failed</p>
              </div>
            </div>
            <div class="columns">
              <p class="column is-12">{{transaction.hash}}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      transactions: []
    }
  },
  computed: {
    processedTransactions() {
      let arr = []
      const fullTransactions = arr.concat(this.transactions, this.$store.state.accounts.pendingTransactions);
      const sortedTransactions = fullTransactions.sort((trx1, trx2) => {
        if(typeof trx2.timestamp === 'undefined')
          return 1
        if(typeof trx1.timestamp === 'undefined')
          return -1
        return trx2.timestamp - trx1.timestamp;
      });
      return sortedTransactions.map(trx => {
        let processedTrs = {};
        if(trx.timestamp) {
          const date = new Date(trx.timestamp*1000);
          processedTrs.timestamp = date.toLocaleString();
        }
        processedTrs.recieve = trx.to === this.$store.state.accounts.activeAccount.getAddressString();
        processedTrs.address = processedTrs.recieve ? trx.from : trx.to;
        processedTrs.value = trx.value;
        processedTrs.hash = trx.hash;
        if(trx.success)
          processedTrs.success = trx.success;
        return processedTrs;
      })
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
  }
}
</script>

<style lang="scss">
  .transactions {
      max-width: 700px;
  }
</style>
