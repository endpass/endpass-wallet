<template>
  <div class="receive-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Receive ETH</h1>
        <div class="box">
          <p>Your Wallet Address:</p>
          <p class="code address is-size-5">{{address}}</p>
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
import EthplorerService from '../services/ethplorer'
import accounts from '@/mixins/accounts'

export default {
  data () {
    return {
      transactions: []
    }
  },
  computed: {
    processedTransactions() {
      return this.transactions.sort((trx1, trx2) => {
        return trx2.timestamp - trx1.timestamp;
      });
    }
  },
  created() {
    EthplorerService.getInfo(this.address).then((resp) => {
      this.transactions = resp.data.filter((trx) => {
        return trx.to === this.address;
      });
    })
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
