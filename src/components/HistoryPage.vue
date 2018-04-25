<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Transaction history</h1>
        <ul class="transactions">
          <li class="box" v-for="transaction in processedTransactions">
            <div class="columns">
              <div class="column is-10">
                <h2 class="subtitle">
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
        const date = new Date(trx.timestamp*1000);
        let day = (date.getDay() < 10 ? '0' : '' ) + date.getDay();
        let month = (date.getMonth() < 10 ? '0' : '' ) + date.getMonth();
        let hours = (date.getHours() < 10 ? '0' : '' ) + date.getHours();
        let minutes = (date.getMinutes() < 10 ? '0' : '' ) + date.getMinutes();
        processedTrs.timestamp = `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
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
  .transactions {
      max-width: 700px;
  }
</style>
