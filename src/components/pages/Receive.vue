<template>
  <div 
    v-if="address" 
    class="app-page receive-page"
  >
    <div class="section">
      <div class="container">
        <account-wallet-card
          :address="address"
          :balance="balance"
          :is-current-account="true"
          :active-currency-name="activeCurrency.name"
          data-test="current-account"
        />
      </div>
    </div>

    <div class="section">
      <div class="container">
        <account-wallet-card
          v-for="(wallet, walletAddress) in wallets"
          v-if="walletAddress !== address"
          :key="walletAddress"
          :address="walletAddress"
          :balance="balances[walletAddress]"
          :active-currency-name="activeCurrency.name"
          :allow-send="!wallet.isPublic"
          data-test="account"
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
                <app-transaction :transaction="transaction"/>
              </li>
            </ul>
            <v-spinner v-else-if="isLoading"/>
            <p v-else>This account has no transactions.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import web3 from '@/class/singleton/web3';
import VButton from '@/components/ui/form/VButton';
import AppTransaction from '@/components/Transaction';
import Account from '@/components/Account';
import VSpinner from '@/components/ui/VSpinner';
import AccountWalletCard from '@/components/AccountWalletCard';

const { fromWei } = web3.utils;

export default {
  name: 'ReceivePage',

  data() {
    return {
      isLoading: true,
      balances: {},
    };
  },

  computed: {
    ...mapState({
      address: state => state.accounts.address,
      activeCurrency: state => state.web3.activeCurrency,
      wallets: state => state.accounts.wallets,
      activeNetId: state => state.web3.activeNet.id,
    }),
    ...mapGetters('accounts', ['wallet', 'balance']),
    ...mapGetters('transactions', ['incomingTransactions']),
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

    async getHistory() {
      if (!this.address) {
        this.isLoading = false;
        return;
      }
      this.isLoading = true;
      await this.updateTransactionHistory();
      this.isLoading = false;
    },

    // TODO: move balances to the store, because it is not logic of view layer
    getBalances() {
      Object.keys(this.wallets).forEach(async address => {
        const balance = await web3.eth.getBalance(address);

        this.$set(this.balances, address, fromWei(balance));
      });
    },
  },

  components: {
    Account,
    AppTransaction,
    VSpinner,
    VButton,
    AccountWalletCard,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
</style>
