<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Transaction history</h1>
      </div>
    </div>

    <div class="section">
      <ul>
        <li v-for="transaction in processedTransactions" :class="{}">
          <div class="columns">
            <div class="column is-10">
              <h2>
                {{transaction.timestamp}}
              </h2>
              <p>
                <span v-if="transaction.recieve">From: </span>
                <span v-if="!transaction.recieve">To: </span>
                {{transaction.address}}
              </p>
            </div>
            <div class="column is-2">
              <p>{{transaction.value}} ETH</p>
            </div>
          </div>
          <div class="columns">
            <p class="column is-12">{{transaction.hash}}</p>
          </div>
        </li>
      </ul>
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
      const sortedTransactions = this.transactions.sort((trx1, trx2) => {
        return trx2.timestamp - trx1.timestamp;
      });
      return sortedTransactions.map(trx => {
        let processedTrs = {};
        const date = new Date(trx.timestamp*1000)
        processedTrs.timestamp = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
        processedTrs.recieve = trx.to === this.$store.state.accounts.activeAccount.getAddressString();
        processedTrs.address = processedTrs.recieve ? trx.from : trx.to;
        processedTrs.value = trx.value;
        processedTrs.hash = trx.hash;
        return processedTrs;
      })
    }
  },
  created() {
    const address = this.$store.state.accounts.activeAccount.getAddressString();
    this.$http.get(`https://api.ethplorer.io/getAddressTransactions/${address}`, {
      params: {
        apiKey: 'freekey'
      }
    }).then((resp) => {
      this.transactions = resp.body;
    })
  }
}
</script>

<style lang="scss">
</style>
