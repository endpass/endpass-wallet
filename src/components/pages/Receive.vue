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
            <v-button v-if="!wallet.isPublic" @click="clickSendButton(walletAddress)" type="button" name="button">Send ethereum</v-button>
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
            <ul class="transactions" v-if="incomingTransactions.length">
              <li v-for="transaction in incomingTransactions"
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
import web3 from '@/utils/web3';
import { Token, ERC20Token } from '@/class';
import TokenList from '@/components/TokenList';
import VButton from '@/components/ui/form/VButton';
import AppTransaction from '@/components/Transaction';
import Account from '@/components/Account';
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
      activeNetId: state => state.web3.activeNet.id,
    }),
    ...mapGetters('accounts', {
      balance: 'balance',
    }),
    ...mapGetters('transactions', ['incomingTransactions']),
  },
  watch: {
    address: {
      handler: 'getHistory',
      immediate: true,
    },
    wallets: {
      handler() {
        this.getTokensLists();
        this.getBalances();
      },
      immediate: true,
    },
    activeNetId: {
      handler: 'getBalances',
      immediate: true,
    },
  },
  methods: {
    ...mapActions('transactions', ['updateTransactionHistory']),
    ...mapActions('tokens', [
      'getTokensWithBalanceByAddress',
      'getTokensBalancesByAddress',
    ]),
    ...mapActions('accounts', ['selectWallet']),
    async clickSendButton(address) {
      this.selectWallet(address);
      this.$router.push('/send');
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
    getBalances() {
      Object.keys(this.wallets).forEach(async address => {
        const balance = await web3.eth.getBalance(address);
        this.$set(this.balances, address, web3.utils.fromWei(balance));
      });
    },
    getTokensLists() {
      Object.keys(this.wallets).forEach(async address => {
        let tokens = await this.getTokensWithBalanceByAddress({ address });
        const balances = await this.getTokensBalancesByAddress({
          tokens: tokens.map(token => new ERC20Token(token.address)),
        });
        this.$set(
          this.tokens,
          address,
          tokens.map(token => {
            const tokenInstance = new Token(token);
            tokenInstance.balance = balances[token.address];
            return tokenInstance;
          }),
        );
      });
    },
  },
  components: {
    Account,
    AppTransaction,
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
