<template>
      <div class="home-page app-page">
        <div class="section" v-if="address">
          <div class="container">
            <div class="card app-card">
              <div class="card-content">
                <div class="columns">
                  <div class="column">
                    <p class="heading">Your Address</p>
                    <account
                       :address="address"
                       :balance="balance"
                       :currency="activeCurrency.name"
                       />
                  </div>
                  <div class="column" v-if="!isPublicAccount">
                    <p class="heading">Actions</p>
                    <router-link :to="{name: 'ExportWallet'}">
                      <span class="icon is-small"
                            v-html="require('@/img/arrow-thick-bottom.svg')"></span>Export
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section" v-else>
          <div class="has-text-centered">
            <div class="card app-card main-app-card">
            <div class="card-content">
              <h1 class="title">Welcome</h1>
              <p class="subtitle">Get started by generating or importing an
              Ethereum wallet.</p>
              <div class="is-centered">
                <router-link :to="{name: 'NewWallet'}" class="button
                is-success is-cta">Create New Wallet</router-link>
                <div>
                  <router-link :to="{name: 'ImportWallet'}"
                  class="has-text-link">Import an existing wallet</router-link>
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
import accounts from '@/mixins/accounts';
import { mapGetters, mapState } from 'vuex';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapGetters('accounts', {
      isPublicAccount: 'isPublicAccount',
      balance: 'balance',
    }),
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
  },
};
</script>

<style lang="scss">
</style>
