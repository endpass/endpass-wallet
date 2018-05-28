<template>
  <div class="new-wallet app-page">
    <div class="section" v-if="walletCreated">
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
              <p class="code">{{mnemonic.phrase}}</p>
            </div>
            <router-link to="/" class="button is-primary">I have written down my seed phrase</router-link>
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
            <button id="newWalletButon" class="button is-primary is-medium" :class="{'is-loading' : creatingWallet }" @click="clickNewWalletButton">Generate New Wallet</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import router from '../router'
import Bip39 from 'bip39'
import EthWallet from 'ethereumjs-wallet'
import HDKey from 'ethereumjs-wallet/hdkey'

export default {
  data () {
    return {
      creatingWallet: false,
      mnemonic : {
        phrase: '', //BIP39 mnemonic
        seed: '', //Derived from mnemonic phrase
        path: `m/44'/60'/0'/0` //Derivation path
      }
    }
  },
  computed: {
    // Wallet has been created
    walletCreated () {
      return this.mnemonic.seed && !this.creatingWallet
    }
  },
  methods: {
    // Generate a new HD wallet node
    // TODO encrypt seed in memory
    clickNewWalletButton() {
      if(this.creatingWallet)
        return
      this.creatingWallet = true;
      this.runWalletGenerationWorker()
      .then(this.commitWalletCreationChanges)
      .catch(this.throwCreationError);
    },
    runWalletGenerationWorker() {
      let promise = new Promise((resolve, reject) => {
        setTimeout(()=>{
          try {
            this.mnemonic.phrase = Bip39.generateMnemonic()
            this.mnemonic.seed = Bip39.mnemonicToSeed(this.mnemonic.phrase);
            const hdWalletPreDrive = HDKey.fromMasterSeed(this.mnemonic.seed);
            const hdWallet = hdWalletPreDrive.derivePath(this.mnemonic.path);
            resolve(hdWallet)
          } catch (e) {
            reject(e);
          }
        },20)
      });
      return promise
    },
    commitWalletCreationChanges(hdWallet){
      this.$store.commit('accounts/setWallet', hdWallet);
      let account = hdWallet.deriveChild(0).getWallet();
      this.$store.dispatch('accounts/addAccount', account);
      this.creatingWallet = false;
    },
    throwCreationError(error) {
      console.error(error);
      this.creatingWallet = false;
    }
  }
}
</script>
