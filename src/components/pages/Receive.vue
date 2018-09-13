<template>
  <div class="app-page receive-page">
    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h2 class="card-header-title">Receive ETH</h2>
          </div>
          <div class="card-content">
            <p>Your Active Address:</p>
            <account v-if="address"
              :currency="activeCurrency.name"
              :address="address"
              :balance="balance"
            />
            <token-list/>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="card app-card" v-for="(wallet, address) in wallets" :key="address">
          <div class="card-header">
            <h2 class="card-header-title">Receive ETH</h2>
          </div>
          <div class="card-content">
            <account
              :currency="activeCurrency.name"
              :address="address"
              :balance="balances[address]"
            />
            <token-list v-if="tokens[address]" :tokens="tokens[address]" />
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
            <ul class="transactions" v-if="sortedTransactions.length">
              <li v-for="transaction in processedTransactions"
                :key="transaction.hash">
                <app-transaction :transaction="transaction"></app-transaction>
              </li>
            </ul>
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
import { ethplorerService } from '@/services';
import { Token, ERC20Token } from '@/class';
import web3 from '@/utils/web3';
import TokenList from '@/components/TokenList';
import appTransaction from '@/components/Transaction';
import Account from '@/components/Account';
import EthplorerService from '@/services/ethplorer';
import VSpinner from '@/components/ui/VSpinner';

export default {
  name: 'receive-page',
  data() {
    return {
      isLoading: true,
      isLoadingBalances: {},
      balances: {},
      tokens: {},
    };
  },
  computed: {
    ...mapState({
      activeCurrency: state => state.web3.activeCurrency,
      address: state =>
        state.accounts.address &&
        state.accounts.address.getChecksumAddressString(),
      wallets: state => state.accounts.wallets,
      activeNet: state => state.web3.activeNet,
    }),
    ...mapGetters('accounts', {
      balance: 'balance',
    }),
    ...mapGetters('transactions', ['currentNetTransactions']),
    incomingTransactions() {
      return (this.transactions || []).filter(trx => trx.to === this.address);
    },
    sortedTransactions() {
      return this.incomingTransactions.sort(
        (trx1, trx2) => trx2.timestamp - trx1.timestamp,
      );
    },
  },
  methods: {
    ...mapActions('transactions', ['updateTransactionHistory']),
    async getHistory() {
      if (!this.address) {
        this.isLoading = false;
        return;
      }
      this.isLoading = true;
      await this.updateTransactionHistory();
      this.isLoading = false;
    },
    getBalances(address) {
      let addresses = Object.keys(this.wallets);
      addresses.forEach(this.getBalance);
    },
    getTokensLists(address) {
      let addresses = Object.keys(this.wallets);
      addresses.forEach(this.getTokensList);
    },
    async getBalance(address) {
      this.isLoadingBalances[address] = true;
      let balance = await this.wallets[address].getBalance();
      balance = web3.utils.fromWei(balance);
      this.$set(this.balances, address, balance);
      this.isLoadingBalances[address] = false;
    },
    async getTokensList(address) {
      this.isLoadingBalances[address] = true;
      let tokensList = await ethplorerService.getTokensWithBalance(address);
      const allBalances = await Promise.all(
        tokensList
          .map(token => new ERC20Token(token.address))
          .map(async erc20 => {
            try {
              let balance = await erc20.getBalance(address);
              console.log(balance);
              return [erc20.address, balance];
            } catch (e) {
              console.log(e);
              return [erc20.address, null];
            }
          }),
      );

      console.log(allBalances);
      // In format {address: balance}
      const balances = allBalances.reduce((obj, item) => {
        obj[item[0]] = item[1];
        return obj;
      }, {});
      console.log(balances);
      this.$set(
        this.tokens,
        address,
        tokensList.map(token => {
          const tokenObj = new Token(token);
          tokenObj.balance = balances[token.address];
          return tokenObj;
        }),
      );
      this.isLoadingBalances[address] = false;
    },
  },
  created() {
    this.$watch(vm => [vm.activeNet.id, vm.wallets].join(), this.getBalances, {
      immediate: true,
    });
    this.$watch(vm => vm.wallets, this.getTokensLists, {
      immediate: true,
    });
    this.$watch(vm => vm.address, this.getHistory, {
      immediate: true,
    });
  },
  components: {
    Account,
    appTransaction,
    VSpinner,
    TokenList,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
</style>
