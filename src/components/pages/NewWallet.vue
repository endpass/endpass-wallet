<template>
  <base-page class="new-wallet">
    <template slot="title">
      {{ componentTitle }}
    </template>
    <div
      v-if="isCreated"
      class="container has-text-centered is-narrow"
      data-test="create-successful"
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
      data-test="create-in-progress"
    >
      <p class="subtitle">
        {{ $t('components.newWallet.inProgress') }}
      </p>
    </div>
  </base-page>
</template>

<script>
import { mapActions } from 'vuex';
import BasePage from '@/components/pages/Base';

export default {
  data() {
    return {
      isCreated: false,
    };
  },

  computed: {
    componentTitle() {
      return this.isCreated
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
      this.isCreated = true;
    } catch (e) {
      this.$notify({
        title: this.$t('components.newWallet.errorCreatingWallet'),
        text: this.$t('components.newWallet.couldNotCreateWallet'),
        type: 'is-danger',
      });
      /* eslint-disable-next-line no-console */
    }
  },

  components: {
    BasePage,
  },
};
</script>
