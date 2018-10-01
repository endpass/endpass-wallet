<template>
  <div class="home-page app-page">
    <div
      v-if="address"
      class="auth-content"
    >

      <div
        class="section section-address"
        data-test="address-card"
      >
        <div class="container">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">Your Address</p>
            </div>
            <div class="card-content">
              <div class="columns">
                <div class="column">
                  <account
                    :address="address"
                  />
                </div>
                <div
                  v-if="!isPublicAccount"
                  class="column is-one-third"
                >
                  <router-link
                    :to="{name: 'ExportWallet'}"
                    class="button is-warning"
                    data-test="export-wallet-button"
                  >
                    Export Private Key
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section section-tokens">
        <div class="container">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">Your Tokens</p>
              <div class="card-header-icon">
                <router-link
                  :to="{name: 'TokensPage'}"
                  class="button is-outlined is-info is-small"
                  data-test="edit-tokens-button"
                >
                  Edit
                </router-link>
              </div>
            </div>
            <div class="card-content">
              <tokens-list :tokens="allCurrentAccountTokensList" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="section">
        <div class="has-text-centered">
          <div class="card app-card main-app-card">
            <div class="card-content">

              <div v-if="isLoggedIn">
                <h1 class="title">Welcome</h1>
                <p class="subtitle">Get started by generating an
                Ethereum wallet.</p>
                <div class="is-centered">
                  <router-link
                    :to="{name: 'NewWallet'}"
                    class="button is-success is-cta"
                  >
                    Create New Wallet
                  </router-link>
                </div>
              </div>

              <div v-else>
                <p class="subtitle">Please log in to continue.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import Balance from '@/components/Balance';
import Account from '@/components/Account';
import TokensList from '@/components/TokensList';

export default {
  name: 'Home',

  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapGetters('accounts', ['accountAddress', 'isPublicAccount', 'balance']),
    ...mapGetters('tokens', ['allCurrentAccountFullTokens']),
    ...mapState({
      activeCurrency: state => state.web3.activeCurrency,
      address: state =>
        state.accounts.address &&
        state.accounts.address.getChecksumAddressString(),
    }),

    allCurrentAccountTokensList() {
      return Object.values(this.allCurrentAccountFullTokens);
    },
  },

  watch: {
    address: {
      async handler() {
        if (this.address) {
          await this.getCurrentAccountTokensBalances();
        }
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions('tokens', ['getCurrentAccountTokensBalances']),
  },

  components: {
    Account,
    Balance,
    TokensList,
  },
};
</script>

<style lang="scss">
</style>
