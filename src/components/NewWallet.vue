<template>
  <div class="new-wallet">
    <div class="section">
      <div class="container">
        <h1 class="title">Create Wallet</h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // Mnemonic to generate HD wallet
      mnemonic: {
        phrase: '', //BIP39 mnemonic
        seed: '', //Derived from mnemonic phrase
        path: `m/44'/60'/0'/0` //Derivation path
      },
      // root hd wallet object from which accounts are derived
      hdWallet: null,
    }
  }
}
</script>
