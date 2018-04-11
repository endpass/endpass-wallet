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
                <input v-model="privateKey" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Private key">
              </div>
            </div>
            <button class="button is-primary" @click="addWalletWithKey">Add</button>
          </form>
          <h1 class="title">Import wallet with HDkey seed</h1>
          <form>
            <div class="field">
              <label class="label" for="hdkeySeed">Hdkey phrase</label>
              <div class="control">
                <input v-model="hdkeyPrase" type="text" class="input" id="hdkeySeed" aria-describedby="privateKey" placeholder="Hdkey phrase">
              </div>
            </div>
            <button class="button is-primary" @click="addWalletWithPrase">Add</button>
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
      const account = EthWallet.fromPrivateKey(new Buffer(this.privateKey, 'hex'));
      console.log(account);
      this.$emit('add-account', account)
    },
    addWalletWithPrase() {
      const hdKey = HDKey.fromMasterSeed(this.hdkeyPrase);
      this.hdWallet = hdKey.derivePath(this.mnemonic.path);
      let account = this.hdWallet.deriveChild(0).getWallet();
      this.$emit('add-account', account);
    },
    // genHDAccount (i) {
    //   i = i || 0
    //   let account = this.hdWallet.deriveChild(i).getWallet()
    //   return account
    // }
  }
}
</script>
