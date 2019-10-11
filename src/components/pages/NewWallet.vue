<template>
  <base-page class="new-wallet">
    <template slot="title">
      {{ componentTitle }}
    </template>
    <div
      v-if="hdKey"
      class="container has-text-centered is-narrow"
    >
      <p class="subtitle">
        {{ $t('components.newWallet.successful') }}
      </p>
      <router-link
        to="/"
        class="button is-success is-cta"
      >
        {{ $t('global.continue') }}
      </router-link>
    </div>
    <div
      v-else
      class="container has-text-centered is-narrow"
    >
      <p class="subtitle">
        {{ $t('components.newWallet.inProgress') }}
      </p>
    </div>
  </base-page>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import BasePage from '@/components/pages/Base';

export default {
  data() {
    return {
      password: '',
      key: null,
    };
  },

  computed: {
    ...mapState({
      hdKey: state => state.accounts.hdKey,
    }),

    componentTitle() {
      return this.hdKey
        ? this.$t('components.newWallet.walletCreated')
        : this.$t('components.newWallet.createWallet');
    },
  },

  methods: {
    ...mapActions('accounts', ['createNewWallet']),
  },

  async mounted() {
    try {
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'create_wallet',
      });
      await this.createNewWallet();
    } catch (e) {
      this.$notify({
        title: this.$t('components.newWallet.errorCreatingWallet'),
        text: this.$t('components.newWallet.couldNotCreateWallet'),
        type: 'is-danger',
      });
      /* eslint-disable-next-line no-console */
      console.error(e);
    }
  },

  components: {
    BasePage,
  },
};
</script>
