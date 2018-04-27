<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Receive ETH</h1>
        <p>{{address}}</p>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="">
          <h2 class="subtitle">Incoming Payment History</h2>
          <ul class="transactions">
            <li class="box" v-for="transaction in processedTransactions">
              <div class="columns">
                <div class="column is-9">
                  <h2 class="subtitle">
                    <span>{{transaction.timestamp}}</span>
                  </h2>
                  <p>
                    <span>From: </span>
                    {{transaction.from}}
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
    address() {
      return this.$store.state.accounts.activeAccount.getAddressString()
    },
    processedTransactions() {
      let arr = []
      const sortedTransactions = this.transactions.sort((trx1, trx2) => {
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
      this.transactions = resp.body.filter((trx) => {
        return trx.to === this.address;
      });
    })
  }
}
</script>

<style lang="scss">
  .transactions {
      max-width: 700px;
  }
</style>
