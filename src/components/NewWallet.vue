<template>
  <div class="new-wallet">
    <div class="section">
      <div class="container">
        <h1 class="title">Create Wallet</h1>
        <p>Just click the button below to create a new, secure Ethereum
        Wallet</p>
        <button id="newWalletButon" class="button is-primary" :class="{'is-loading' : creatingWallet }" @click="clickNewWalletButton">Generate New Wallet</button>
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
            let account = hdWallet.deriveChild(0).getWallet();
            resolve(account)
          } catch (e) {
            reject(e);
          }
        },10)
      });
      return promise
    },
    commitWalletCreationChanges(account){
      this.$store.commit('accounts/addAccount', account);
      this.$store.dispatch('accounts/updateBalance');
      this.$store.dispatch('accounts/subscribeOnBalanceUpdates');
      router.push('/');
      this.creatingWallet = false;
    },
    throwCreationError(error) {
      console.log(error);
      this.creatingWallet = false;
    }
  }
}
</script>
