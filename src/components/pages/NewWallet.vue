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
        {{ $t('component.newWallet.paragaph1') }}
        <strong>{{ $t('component.newWallet.paragaph2') }}</strong>
        {{ $t('component.newWallet.paragaph3') }}
      </p>
      <div class="box">
        <p>{{ $t('component.newWallet.yourSeedPhrase') }}</p>
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
        {{ $t('component.newWallet.paragaph4') }}
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
          :label="$t('component.newWallet.walletPassword')"
          name="password"
          data-vv-as="password"
          data-vv-name="password"
          aria-describedby="jsonKeystorePassword"
          :placeholder="$t('component.newWallet.walletPassword')"
          required
          data-test="input-new-wallet-password"
        />
        <v-button
          :loading="isCreating"
          :disabled="!isFormValid"
          class-name="is-success is-cta"
        >
          {{ $t('component.newWallet.createNewWallet') }}
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
        ? this.$t('component.newWallet.walletCreated')
        : this.$t('component.newWallet.createWallet');
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
          title: this.$t('component.newWallet.errorCreatingWallet'),
          text: this.$t('component.newWallet.couldNotCreateWallet'),
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
