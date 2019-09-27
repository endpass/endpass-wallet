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
        {{ $t('components.newWallet.paragaph1') }}
        <strong>{{ $t('components.newWallet.paragaph2') }}</strong>
        {{ $t('components.newWallet.paragaph3') }}
      </p>
      <div class="box">
        <p>{{ $t('components.newWallet.yourSeedPhrase') }}</p>
        <p
          class="code"
          data-test="seed-phrase"
        >
          {{ key }}
        </p>
      </div>
      <router-link
        to="/"
        class="button is-success is-cta"
        @click.native="onContinue"
      >
        {{ $t('global.continue') }}
      </router-link>
    </div>
    <div
      v-else
      class="container has-text-centered is-narrow"
    >
      <p class="subtitle">
        {{ $t('components.newWallet.paragaph4') }}
      </p>
      <v-form
        :is-form-valid="isFormValid"
        @submit="createWallet"
      >
        <v-password
          id="jsonKeystorePassword"
          v-model="password"
          v-validate="'required|min:8'"
          :error="errors.first('password')"
          :label="$t('components.newWallet.walletPassword')"
          name="password"
          data-vv-as="password"
          data-vv-name="password"
          aria-describedby="jsonKeystorePassword"
          :placeholder="$t('components.newWallet.walletPassword')"
          required
          data-test="input-new-wallet-password"
        />
        <v-button
          :loading="isCreating"
          :disabled="!isFormValid"
          class-name="is-success is-cta"
        >
          {{ $t('components.newWallet.createNewWallet') }}
        </v-button>
      </v-form>
    </div>
  </base-page>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import BasePage from '@/components/pages/Base';
import formMixin from '@/mixins/form';

export default {
  data() {
    return {
      password: '',
      key: null,
      isCreating: false,
      isCloseAfterCreate: false,
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

    // Generate a new HD wallet node
    // TODO encrypt seed in memory
    async createWallet() {
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'create_wallet',
      });
      this.isCreating = true;
      await new Promise(res => setTimeout(res, 20));

      try {
        const seedKey = await this.createNewWallet({
          password: this.password,
        });
        this.key = seedKey;
      } catch (e) {
        this.$notify({
          title: this.$t('components.newWallet.errorCreatingWallet'),
          text: this.$t('components.newWallet.couldNotCreateWallet'),
          type: 'is-danger',
        });
        /* eslint-disable-next-line no-console */
        console.error(e);
      }

      this.isCreating = false;
    },

    onContinue() {
      if (this.isCloseAfterCreate) {
        window.close();
      }
    },
  },

  mounted() {
    this.isCloseAfterCreate = !!this.$route.query.closeAfterCreateWallet;
  },

  mixins: [formMixin],

  components: {
    BasePage,
  },
};
</script>
