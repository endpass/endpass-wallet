<template>
  <div
    v-if="address"
    class="app-page receive-page"
  >
    <div class="section">
      <div class="container">
        <receive-account-card
          :address="address"
          :balance="balance"
          :tokens="trackedTokensWithBalance"
          :is-current-account="true"
          :active-currency-name="activeCurrency.name"
        />
      </div>
    </div>

    <div class="section">
      <div class="container">
        <receive-account-card
          v-for="(wallet, walletAddress) in wallets"
          v-if="walletAddress !== address"
          :key="walletAddress"
          :address="walletAddress"
          :balance="balances[walletAddress]"
          :tokens="tokens[walletAddress]"
          :active-currency-name="activeCurrency.name"
          :allow-send="!wallet.isPublic"
          @send="clickSendButton(walletAddress)"
        />
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h2 class="card-header-title">Incoming Payment History</h2>
          </div>
          <div class="card-content">
            <ul
              v-if="incomingTransactions.length"
              class="transactions"
            >
              <li
                v-for="transaction in incomingTransactions"
                :key="transaction.hash"
              >
                <app-transaction :transaction="transaction" />
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
import VButton from '@/components/ui/form/VButton';
import AppTransaction from '@/components/Transaction';
import Account from '@/components/Account';
import VSpinner from '@/components/ui/VSpinner';
import ReceiveAccountCard from '@/components/ReceiveAccountCard';

export default {
  name: 'ReceivePage',

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
      wallet: state => state.accounts.wallet,
      activeNetId: state => state.web3.activeNet.id,
    }),
    ...mapGetters('accounts', {
      balance: 'balance',
    }),
    ...mapGetters('transactions', ['incomingTransactions']),
    ...mapGetters('tokens', ['trackedTokensWithBalance']),
  },

  watch: {
    address: {
      handler: 'getHistory',
      immediate: true,
    },

    wallet: {
      handler() {
        this.updateTransactionHistory();
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
    ...mapActions('accounts', ['selectWallet']),

    async clickSendButton(address) {
      this.selectWallet(address);
      this.$router.push('/send');
    },

    isTokensLoading(address) {
      return this.tokens[address] === undefined;
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
  },

  components: {
    Account,
    AppTransaction,
    VSpinner,
    VButton,
    ReceiveAccountCard,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
</style>
