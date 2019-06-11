<template>
  <base-page class="new-wallet">
    <template slot="title">
      {{ hdKey ? 'Wallet Created' : 'Create Wallet' }}
    </template>
    <div
      v-if="hdKey"
      class="container has-text-centered is-narrow"
    >
      <p class="subtitle">
        Your wallet has been created successfully. Please
        <strong>write down the 12 word recovery phrase below</strong>
        and store it in a safe place. You will not be able to recover your
        wallet without it.
      </p>
      <div class="box">
        <p>Your wallet recovery phrase</p>
        <p
          class="code"
          data-test="seed-phrase"
        >
          {{ key }}
        </p>
      </div>
      <router-link
        :disabled="!!remainingSeedPhraseTimeout"
        to="/"
        class="button is-success is-cta"
        @click.native="onContinue"
      >
        Continue {{ getRemainingSeedPhraseTimeout }}
      </router-link>
    </div>
    <div
      v-else
      class="container has-text-centered is-narrow"
    >
      <p class="subtitle">
        Just click the button below to create a new, secure Ethereum Wallet.
        Your wallet can contain multiple addresses for storing Ethereum and
        ERC20 compatible tokens.
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
          label="Wallet password"
          name="password"
          data-vv-as="password"
          data-vv-name="password"
          aria-describedby="jsonKeystorePassword"
          placeholder="wallet password"
          required
          data-test="input-new-wallet-password"
        />
        <v-button
          :loading="isCreating"
          :disabled="!isFormValid"
          class-name="is-success is-cta"
        >
          Create New Wallet
        </v-button>
      </v-form>
    </div>
  </base-page>
</template>

<script>
import BasePage from '@/components/pages/Base';
import VueTimers from 'vue-timers/mixin';
import { mapActions, mapState } from 'vuex';
import formMixin from '@/mixins/form';

const SEED_PHRASE_TIMEOUT_SEC = 10;
const UPDATE_SEED_PHRASE_INTERVAL_MSEC = 1000;

export default {
  data() {
    return {
      password: '',
      key: null,
      isCreating: false,
      isCloseAfterCreate: false,
      remainingSeedPhraseTimeout: SEED_PHRASE_TIMEOUT_SEC,
    };
  },

  computed: {
    ...mapState({
      hdKey: state => state.accounts.hdKey,
    }),

    getRemainingSeedPhraseTimeout() {
      return this.remainingSeedPhraseTimeout > 0
        ? `(${this.remainingSeedPhraseTimeout})`
        : '';
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
        this.$timer.start('seedPhrase');
      } catch (e) {
        this.$notify({
          title: 'Error creating wallet',
          text: 'Could not create wallet. Please try again.',
          type: 'is-danger',
        });
        /* eslint-disable-next-line no-console */
        console.error(e);
      }

      this.isCreating = false;
    },

    handleSeedPhraseTimer() {
      this.remainingSeedPhraseTimeout -=
        UPDATE_SEED_PHRASE_INTERVAL_MSEC / 1000;

      if (this.remainingSeedPhraseTimeout <= 0) {
        this.$timer.stop('seedPhrase');
      }
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

  mixins: [VueTimers, formMixin],

  timers: {
    seedPhrase: {
      repeat: true,
      time: UPDATE_SEED_PHRASE_INTERVAL_MSEC,
      callback() {
        this.handleSeedPhraseTimer();
      },
    },
  },

  components: {
    BasePage,
  },
};
</script>
