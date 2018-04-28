<template>
  <div class="new-wallet">
    <div class="section">
      <div class="container">
        <h1 class="title">Import Existing Wallet</h1>
        <div class="columns">

          <div class="column">

            <div class="import-private-key" v-if="importType === 'privateKey'">
              <h2 class="subtitle">Import Private Key</h2>
              <form>
                <div class="field">
                  <label class="label" for="privateKey">Private key</label>
                  <div class="control">
                    <input v-model="privateKey" @change="(privateKeyError = false)" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Private key">
                    <p v-show="privateKeyError" class="help is-danger">Private key is invalid</p>
                  </div>
                </div>
                <button class="button is-primary" @click="addWalletWithKey"
                  :disabled="!privateKey || privateKeyError">Import</button>
              </form>
            </div>

            <div class="import-seed-phrase" v-if="importType ===
              'seedPhrase'">
              <h2 class="subtitle">Import Seed Phrase</h2>
              <form>
                <div class="field">
                  <label class="label" for="hdkeySeed">Seed phrase</label>
                  <div class="control">
                    <input v-model="hdkeyPrase" @change="(hdkeyPraseError =
                    false)" type="text" class="input" id="hdkeySeed"
                    aria-describedby="privateKey" placeholder="Seed phrase">
                    <p v-show="hdkeyPraseError" class="help is-danger">Seed phrase is invalid</p>
                  </div>
                </div>
                <button class="button is-primary"
                  @click="addWalletWithPrase" :disabled="!hdkeyPrase ||
                  hdkeyPraseError">Import</button>
              </form>
            </div>
          </div>

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
      importType: 'seedPhrase',
      mnemonic: {
        phrase: '', //BIP39 mnemonic
        seed: '', //Derived from mnemonic phrase
        path: `m/44'/60'/0'/0` //Derivation path
      }
    }
  },
  methods: {
    addAccount(account) {
      this.$store.commit('accounts/addAccount', account);
      this.$store.dispatch('accounts/updateBalance');
      this.$store.dispatch('accounts/subscribeOnBalanceUpdates');
    },
    addWalletWithKey() {
      try {
        this.addAccount(this.createWalletWithKey());
      } catch (e) {
        this.privateKeyError = true;
      }
    },
    createWalletWithKey() {
      return EthWallet.fromPrivateKey(new Buffer(this.privateKey, 'hex'));
    },
    addWalletWithPrase() {
      try {
        this.addAccount(this.createWalletWithPrase());
      } catch (e) {
        this.hdkeyPraseError = true;
      }
    },
    createWalletWithPrase() {
      const hdKey = HDKey.fromMasterSeed(this.hdkeyPrase);
      const hdWallet = hdKey.derivePath(this.mnemonic.path);
      return hdWallet.deriveChild(0).getWallet();
    }
  }
}
</script>
