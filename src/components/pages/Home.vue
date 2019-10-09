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
              <p class="card-header-title">
                {{ $t('components.home.address') }}
              </p>
            </div>
            <div class="card-content">
              <div class="columns">
                <div class="column">
                  <account :address="address" />
                </div>
                <div
                  v-if="isExportable"
                  :class="{ 'has-text-centered': !isFaucet }"
                  class="column"
                >
                  <router-link
                    :to="{ name: 'ExportWallet' }"
                    class="button is-warning"
                    data-test="export-wallet-button"
                  >
                    {{ $t('components.home.exportKey') }}
                  </router-link>
                </div>
                <div
                  v-if="isFaucet"
                  class="column"
                >
                  <v-faucet-button
                    :address="address"
                    class="button is-warning"
                    @donate="onDonate"
                    @donate-error="onDonateError"
                  >
                    <div
                      slot-scope="{ sendRequest, isLoading }"
                      class="button is-warning"
                      data-test="get-test-eth-button"
                      :disabled="isFaucetDisable || isLoading"
                      @click="sendRequest"
                    >
                      {{ faucetTitle }}
                    </div>
                  </v-faucet-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="currentNetUserTokensList.length > 0"
        class="section section-tokens"
      >
        <div class="container">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">
                {{ $t('components.home.tokens') }}
              </p>
              <div class="card-header-icon">
                <router-link
                  :to="{ name: 'TokensPage' }"
                  class="button is-outlined is-info is-small"
                  data-test="edit-tokens-button"
                >
                  {{ $t('components.home.edit') }}
                </router-link>
              </div>
            </div>
            <div class="card-content">
              <tokens-list :tokens="currentNetUserTokensList" />
            </div>
          </div>
        </div>
      </div>

      <div class="section section-tokens">
        <div class="container">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">
                {{ $t('components.home.accountTokens') }} ({{ address }})
              </p>
            </div>
            <div class="card-content">
              <tokens-list :tokens="currentAccountTokensList" />
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
                <h1 class="title">
                  {{ $t('components.home.welcome') }}
                </h1>
                <p class="subtitle">
                  {{ $t('components.home.generateWallet') }}
                </p>
                <div class="is-centered">
                  <router-link
                    :to="{ name: 'NewWallet', query: $route.query }"
                    class="button is-success is-cta"
                  >
                    {{ $t('components.home.createNewWallet') }}
                  </router-link>
                </div>
              </div>
              <div v-else>
                <p class="subtitle">
                  {{ $t('components.home.login') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import VueTimers from 'vue-timers/mixin';
import get from 'lodash/get';
import { fromTo } from '@endpass/utils/date';
import { VFaucetButton } from '@endpass/faucet';
import Network from '@endpass/class/Network';
import Account from '@/components/Account';
import TokensList from '@/components/TokensList';

const UPDATE_RESEND_TIMEOUT_SEC = 1000 * 60 * 2; // 2 mins

export default {
  name: 'Home',

  data() {
    return {
      isFaucetDisable: false,
      faucetTitle: 'Get test 1 ETH',
    };
  },

  computed: {
    ...mapState({
      address: state => state.accounts.address,
      activeNet: state => state.web3.activeNet,
    }),
    ...mapGetters('user', ['isLoggedIn']),
    ...mapGetters('accounts', [
      'isPublicAccount',
      'isHardwareAccount',
      'balance',
    ]),
    ...mapGetters('tokens', [
      'allCurrentAccountFullTokens',
      'currentNetUserFullTokens',
      'currentAccountFullTokens',
    ]),

    currentNetUserTokensList() {
      return Object.values(this.currentNetUserFullTokens);
    },

    currentAccountTokensList() {
      return Object.values(this.currentAccountFullTokens);
    },

    isExportable() {
      return !this.isPublicAccount && !this.isHardwareAccount;
    },

    isFaucet() {
      return this.activeNet.id === Network.NET_ID.ROPSTEN;
    },
  },

  methods: {
    onDonate() {
      this.$notify({
        title: this.$t('components.home.faucetEth'),
        text: this.$t('components.home.faucetEthWait'),
        type: 'is-info',
      });

      this.$timer.start('startCountdown');
      this.faucetTitle = this.$t('components.home.faucetEthNoTrys');
      this.isFaucetDisable = true;
    },

    onDonateError(err) {
      const duration = get(err, 'response.data.duration', 0);
      const timeTitle = duration
        ? fromTo(0, duration)
        : this.$t('components.home.inTime');

      this.$notify({
        title: this.$t('components.home.manyAttempts'),
        text: this.$t('components.home.walletBanned', { timeTitle }),
        type: 'is-warning',
      });

      this.faucetTitle = this.$t('components.home.manyAttempts');
      this.isFaucetDisable = true;
    },
    onFaucetTimer() {
      this.faucetTitle = this.$t('components.home.getEth');
      this.isFaucetDisable = false;
    },
  },

  mixins: [VueTimers],

  timers: {
    startCountdown: {
      repeat: false,
      time: UPDATE_RESEND_TIMEOUT_SEC,
      callback() {
        this.onFaucetTimer();
      },
    },
  },

  components: {
    Account,
    TokensList,
    VFaucetButton,
  },
};
</script>

<style lang="scss">
@media screen and (max-width: 1262px) {
  .card-content .columns {
    display: block;
  }
}
</style>
