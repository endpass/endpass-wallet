<template>
  <div
    v-if="address"
    class="app-page receive-page"
  >
    <div class="section">
      <div class="container">
        <account-wallet-card
          :address="address"
          :is-current-account="true"
          :active-currency-name="activeCurrency.name"
          :active-net-id="activeNetId"
          data-test="current-account"
        />
      </div>
    </div>

    <div class="section">
      <div class="container">
        <account-wallet-card
          v-for="(wallet, walletAddress) in filteredWallets"
          :key="walletAddress"
          :address="walletAddress"
          :active-currency-name="activeCurrency.name"
          :allow-send="!wallet.isPublic"
          :active-net-id="activeNetId"
          data-test="account"
          @send="clickSendButton(walletAddress)"
        />
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h2 class="card-header-title">
              Incoming Payment History
            </h2>
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
            <v-spinner v-else-if="isLoading" />
            <p v-else>
              This account has no transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import omit from 'lodash/omit';
import { mapState, mapGetters, mapActions } from 'vuex';
import AppTransaction from '@/components/Transaction';
import AccountWalletCard from '@/components/AccountWalletCard';

export default {
  name: 'ReceivePage',

  data: () => ({
    isLoading: true,
  }),

  computed: {
    ...mapState({
      address: state => state.accounts.address,
      activeCurrency: state => state.web3.activeCurrency,
      wallets: state => state.accounts.wallets,
      activeNetId: state => state.web3.activeNet.id,
    }),
    ...mapGetters('accounts', ['wallet', 'balance', 'isPublicAccount']),
    ...mapGetters('transactions', ['incomingTransactions']),

    filteredWallets() {
      return omit(this.wallets, this.address);
    },
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
  },

  components: {
    AppTransaction,
    AccountWalletCard,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
</style>
