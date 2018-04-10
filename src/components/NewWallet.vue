<template>
  <div class="new-wallet">
    <div class="section">
      <div class="container">
        <h1 class="title">Create Wallet</h1>
        <p>Just click the button below to create a new, secure Ethereum
        Wallet</p>
        <a class="button is-primary" @click="generateHDWallet">Generate New Wallet</a>
      </div>
    </div>
  </div>
</template>

<script>
import Bip39 from 'bip39'
import EthWallet from 'ethereumjs-wallet'
import HDKey from 'ethereumjs-wallet/hdkey'

export default {
  data () {
    return {
      // Mnemonic to generate HD wallet
      mnemonic: {
        phrase: '', //BIP39 mnemonic
        seed: '', //Derived from mnemonic phrase
        path: `m/44'/60'/0'/0` //Derivation path
      },
      // root hd wallet object
      hdWallet: null,
    }
  },
  methods: {
    // Generate a new HD wallet node
    // TODO encrypt seed in memory
    generateHDWallet () {
      try {
        this.mnemonic.phrase = Bip39.generateMnemonic()
        this.mnemonic.seed = Bip39.mnemonicToSeed(this.mnemonic.phrase)

        this.genWalletFromSeed()
        let account = this.genHDAccount(0)
        console.log(account)
        this.$emit('add-account', account)
      } catch(e) {
        console.log(e)
      }
    },
    // Create a wallet node from the seed
    genWalletFromSeed () {
      let hdWallet = HDKey.fromMasterSeed(this.mnemonic.seed)
      this.hdWallet = hdWallet.derivePath(this.mnemonic.path)
    },
    // Generate the next account from HD node
    genHDAccount (i) {
      i = i || 0
      let account = this.hdWallet.deriveChild(i).getWallet()
      return account
    }
  }
}
</script>
