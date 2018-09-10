<template>
  <div class="home-page app-page">
    <div class="auth-content" v-if="address">

      <div class="section section-address">
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
                <div class="column is-one-third" v-if="!isPublicAccount">
                  <router-link class="button is-warning" :to="{name: 'ExportWallet'}">
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
                <router-link :to="{name:
            'TokensPage'}" class="button is-outlined is-info is-small">
                  Edit</router-link>
              </div>
            </div>
            <div class="card-content">
              <token-list/>
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
                  <router-link  :to="{name: 'NewWallet'}" class="button
                  is-success is-cta">Create New Wallet</router-link>
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
import Balance from '@/components/Balance';
import Account from '@/components/Account';
import TokenList from '@/components/TokenList';
import { mapGetters, mapState } from 'vuex';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapGetters('accounts', ['isPublicAccount', 'balance']),
    ...mapState({
      activeCurrency: state => state.web3.activeCurrency,
      address: state =>
        state.accounts.address &&
        state.accounts.address.getChecksumAddressString(),
    }),
  },
  components: {
    Account,
    Balance,
    TokenList,
  },
};
</script>

<style lang="scss">
</style>
