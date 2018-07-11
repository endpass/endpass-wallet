<template>
  <div class="new-wallet app-page">
    <div class="section" v-if="hdWallet">
      <div class="container has-text-centered is-narrow">
        <div class="card app-card">
          <div class="card-content">
            <h1 class="title">Wallet Created</h1>
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
              class="button is-primary"
              :disabled="!!remainingSeedPhraseTimeout"
            >
              I have written down my seed phrase {{getRemainingSeedPhraseTimeout}}
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="section" v-else>
      <div class="container has-text-centered is-narrow">
        <div class="card app-card">
          <div class="card-header">
            <h1 class="card-header-title">Create Wallet</h1>
          </div>
          <div class="card-content">
            <a @click="$router.go(-1)">&lt; Back</a>
            <p class="subtitle">Just click the button below to create a new,
            secure Ethereum Wallet. Your wallet can contain multiple addresses
            for storing Ethereum and ERC20 compatible tokens.</p>
            <v-form>
               <v-input v-model="walletPassword"
                        label="Wallet password"
                        id="jsonKeystorePassword"
                        name="walletPassword"
                        type="password"
                        validator="required|min:8"
                        data-vv-as="password"
                        aria-describedby="jsonKeystorePassword"
                        placeholder="wallet password"
                        required />
              <v-button className="is-primary is-medium"
                        :loading="isCreating"
                        @click.prevent="createWallet">Create New Wallet</v-button>
            </v-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import router from '@/router'
import Bip39 from 'bip39'
import VueTimers from 'vue-timers/mixin'
import { mapActions, mapState } from 'vuex'
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';

const SEED_PHRASE_TIMEOUT_SEC = 10;
const UPDATE_SEED_PHRASE_INTERVAL_MSEC = 1000;

export default {
  data () {
    return {
      walletPassword: '',
      key: null,
      isCreating: false,
      remainingSeedPhraseTimeout: SEED_PHRASE_TIMEOUT_SEC
    }
  },
  computed: {
    ...mapState({
      hdWallet: state => state.accounts.hdWallet
    }),
    getRemainingSeedPhraseTimeout() {
      return this.remainingSeedPhraseTimeout > 0 ? `(${this.remainingSeedPhraseTimeout})` : '';
    }
  },
  methods: {
    ...mapActions('accounts', ['addHdWallet']),
    // Generate a new HD wallet node
    // TODO encrypt seed in memory
    async createWallet() {
      this.isCreating = true;
      let key;
      await new Promise(res => setTimeout(res, 20));
      try {
        key = Bip39.generateMnemonic();
        this.addHdWallet({key, password: this.walletPassword});
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
      this.remainingSeedPhraseTimeout -= UPDATE_SEED_PHRASE_INTERVAL_MSEC / 1000;

      if (this.remainingSeedPhraseTimeout <= 0) {
        this.$timer.stop('seedPhrase');
      }
    }
  },
  mixins: [VueTimers],
  timers: {
    seedPhrase: {
      repeat: true,
      time: UPDATE_SEED_PHRASE_INTERVAL_MSEC,
      callback: function() {
        this.handleSeedPhraseTimer();
      }
    }
  },
  components: {
    VForm,
    VInput,
    VButton,
  }
}
</script>
