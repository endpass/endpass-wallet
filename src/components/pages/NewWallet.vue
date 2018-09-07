<template>
  <base-page class="new-wallet">
    <template slot="title">{{ hdKey ? "Wallet Created" : "Create Wallet" }}</template>
    <div v-if="hdKey" class="container has-text-centered is-narrow">
      <p class="subtitle">Your wallet has been created successfully.
        Please <strong>write down the 12 word recovery phrase below</strong>
        and store it in a safe place. You will not be able to recover your
        wallet without it.</p>
      <div class="box">
        <p>Your wallet recovery phrase</p>
        <p class="code" data-test="seed-phrase">{{key}}</p>
      </div>
      <router-link
        to="/"
        class="button is-success is-cta"
        :disabled="!!remainingSeedPhraseTimeout"
        >
        Continue {{getRemainingSeedPhraseTimeout}}
      </router-link>
    </div>
    <div v-else class="container has-text-centered is-narrow">
      <p class="subtitle">Just click the button below to create a new,
        secure Ethereum Wallet. Your wallet can contain multiple addresses
        for storing Ethereum and ERC20 compatible tokens.</p>
      <v-form @submit="createWallet">
        <v-password v-model="walletPassword"
                    label="Wallet password"
                    id="jsonKeystorePassword"
                    name="walletPassword"
                    validator="required|min:8"
                    data-vv-as="password"
                    aria-describedby="jsonKeystorePassword"
                    placeholder="wallet password"
                    required />
          <v-button className="is-success is-cta"
                    :loading="isCreating">Create New Wallet</v-button>
      </v-form>
    </div>
  </base-page>
</template>

<script>
import router from '@/router';
import BasePage from '@/components/pages/Base';
import Bip39 from 'bip39';
import VueTimers from 'vue-timers/mixin';
import { mapActions, mapState } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VPassword from '@/components/ui/form/VPassword.vue';
import VButton from '@/components/ui/form/VButton.vue';

const SEED_PHRASE_TIMEOUT_SEC = 10;
const UPDATE_SEED_PHRASE_INTERVAL_MSEC = 1000;

export default {
  data() {
    return {
      walletPassword: '',
      key: null,
      isCreating: false,
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
    ...mapActions('accounts', ['addHdWallet']),
    // Generate a new HD wallet node
    // TODO encrypt seed in memory
    async createWallet() {
      this.isCreating = true;
      await new Promise(res => setTimeout(res, 20));

      try {
        const key = Bip39.generateMnemonic();
        await this.addHdWallet({ key, password: this.walletPassword });
        this.key = key;
        this.$timer.start('seedPhrase');
      } catch (e) {
        this.$notify({
          title: 'Error creating wallet',
          text: 'Could not create wallet. Please try again.',
          type: 'is-danger',
        });
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
  },
  mixins: [VueTimers],
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
    VForm,
    VPassword,
    VButton,
  },
};
</script>
