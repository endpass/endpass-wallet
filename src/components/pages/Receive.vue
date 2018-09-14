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
        <div class="card app-card" v-if="walletAddress !== address" v-for="(wallet, walletAddress) in wallets" :key="walletAddress">
          <div class="card-header">
            <h2 class="card-header-title">Receive ETH</h2>
          </div>
          <div class="card-content">
            <account
              :currency="activeCurrency.name"
              :address="walletAddress"
              :balance="balances[walletAddress]"
            />
            <v-button v-if="!isPublicWallet(wallet)" @click="clickSendButton(walletAddress)" type="button" name="button">Send ethereum</v-button>
            <div class="token-list-container">
              <token-list v-if="tokens[walletAddress]" :tokens="tokens[walletAddress]" />
              <v-spinner
                v-else-if="!isTokensLoaded(walletAddress)"
                :is-loading="!isTokensLoaded(walletAddress)"
              />
            </div>
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
import { Token, ERC20Token, Address } from '@/class';
import web3 from '@/utils/web3';
import TokenList from '@/components/TokenList';
import VButton from '@/components/ui/form/VButton';
import appTransaction from '@/components/Transaction';
import Account from '@/components/Account';
import EthplorerService from '@/services/ethplorer';
import VSpinner from '@/components/ui/VSpinner';

export default {
  name: 'receive-page',
  data() {
    return {
      isLoading: true,
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
    ...mapActions('accounts', ['selectWallet']),
    async clickSendButton(address) {
      console.log(web3.utils.hexToBytes(address));
      this.selectWallet(address);
      this.$router.push('/send');
    },
    isPublicWallet(wallet) {
      return wallet instanceof Address;
    },
    isTokensLoaded(address) {
      return typeof this.tokens[address] !== 'undefined';
    },
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
      let balance = await this.wallets[address].getBalance();
      balance = web3.utils.fromWei(balance);
      this.$set(this.balances, address, balance);
    },
    async getTokensList(address) {
      let tokensList = await ethplorerService.getTokensWithBalance(address);
      const allBalances = await Promise.all(
        tokensList
          .map(token => new ERC20Token(token.address))
          .map(async erc20 => {
            try {
              let balance = await erc20.getBalance(address);
              return [erc20.address, balance];
            } catch (e) {
              return [erc20.address, null];
            }
          }),
      );
      // In format {address: balance}
      const balances = allBalances.reduce((obj, item) => {
        obj[item[0]] = item[1];
        return obj;
      }, {});
      this.$set(
        this.tokens,
        address,
        tokensList.map(token => {
          const tokenObj = new Token(token);
          tokenObj.balance = balances[token.address];
          return tokenObj;
        }),
      );
    },
  },
  created() {
    this.$watch(vm => vm.address, this.getHistory, {
      immediate: true,
    });
    this.$watch(vm => vm.activeNet.id, this.getBalances, {
      immediate: true,
    });
    this.$watch(
      vm => vm.wallets,
      () => {
        this.getBalances();
        this.getTokensLists();
      },
      {
        immediate: true,
      },
    );
  },
  components: {
    Account,
    appTransaction,
    VSpinner,
    TokenList,
    VButton,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
.token-list-container {
  min-height: 30px;
  position: relative;
}
</style>
