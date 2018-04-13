<template>
  <div class="new-wallet">
    <div class="section">
      <div class="container">
        <div class="column is-one-quarter-desktop">
          <h1 class="title">Import wallet with private key</h1>
          <form>
            <div class="field">
              <label class="label" for="privateKey">Private key</label>
              <div class="control">
                <input v-model="privateKey" @change="(privateKeyError = false)" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Private key">
                <p v-show="privateKeyError" class="help is-danger">Private key is invalid</p>
              </div>
            </div>
            <button class="button is-primary" @click="addWalletWithKey" :disabled="!privateKey || privateKeyError">Add</button>
          </form>
          <h1 class="title">Import wallet with HDkey seed</h1>
          <form>
            <div class="field">
              <label class="label" for="hdkeySeed">Hdkey phrase</label>
              <div class="control">
                <input v-model="hdkeyPrase" @change="(hdkeyPraseError = false)" type="text" class="input" id="hdkeySeed" aria-describedby="privateKey" placeholder="Hdkey phrase">
                <p v-show="hdkeyPraseError" class="help is-danger">Hdkey phrase is invalid</p>
              </div>
            </div>
            <button class="button is-primary" @click="addWalletWithPrase" :disabled="!hdkeyPrase || hdkeyPraseError">Add</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import EthWallet from 'ethereumjs-wallet'
import HDKey from 'ethereumjs-wallet/hdkey'

export default {
  data () {
    return {
      privateKey: '',
      hdkeyPrase: '',
      privateKeyError: false,
      hdkeyPraseError: false,
      mnemonic: {
        phrase: '', //BIP39 mnemonic
        seed: '', //Derived from mnemonic phrase
        path: `m/44'/60'/0'/0` //Derivation path
      },
      hdWallet:null
    }
  },
  methods: {
    addWalletWithKey() {
      try {
        const account = EthWallet.fromPrivateKey(new Buffer(this.privateKey, 'hex'));
        this.$store.commit('addAccount', account);
      } catch (e) {
        this.privateKeyError = true;
      }
    },
    addWalletWithPrase() {
      try {
        const hdKey = HDKey.fromMasterSeed(this.hdkeyPrase);
        this.hdWallet = hdKey.derivePath(this.mnemonic.path);
        let account = this.hdWallet.deriveChild(0).getWallet();
        this.$store.commit('addAccount', account)
      } catch (e) {
        this.hdkeyPraseError = true;
      }
    },

  }
}
</script>
