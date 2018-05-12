<template>
  <div class="new-wallet">
    <div class="section">
      <div class="container">
        <a @click="$router.go(-1)">&lt; Back</a>
        <h1 class="title">Import Existing Wallet</h1>
        <p class="subtitle">Select the type of wallet you would like to
        import on the left.</p>
        <div class="columns">

          <div class="column is-one-third">
            <div class="menu">
              <p class="menu-label">Import Type</p>
              <ul class="menu-list">
                <li>
                  <a @click="importType = 'seedPhrase'"
                    :class="{'is-active':importType==='seedPhrase'}">Seed Phrase</a>
                </li>
                <li>
                  <a @click="importType = 'privateKey'"
                    :class="{'is-active':importType==='privateKey'}">Private
                  Key</a>
                </li>
              </ul>
            </div>
          </div>

          <div class="column">

            <div class="import-private-key" v-if="importType === 'privateKey'">
              <form>
                <div class="field">
                  <label class="label" for="privateKey">Private key</label>
                  <div class="control">
                    <input v-model="privateKey" @change="(privateKeyError = false)" type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Private key">
                    <p v-show="privateKeyError" class="help is-danger">Private key is invalid</p>
                  </div>
                </div>
                <button class="button is-primary is-medium" @click.prevent="addWalletWithKey"
                  :disabled="!privateKey || privateKeyError">Import</button>
              </form>
            </div>

            <div class="import-seed-phrase" v-if="importType ===
              'seedPhrase'">
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
                <button class="button is-primary is-medium"
                  @click.prevent="addWalletWithPrase" :disabled="!hdkeyPrase ||
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
import router from '@/router'

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
    commitWallet(hdWallet) {
      this.$store.commit('accounts/setWallet', hdWallet);
    },
    addAccount(account) {
      this.$store.dispatch('accounts/addAccount', account);
    },
    addWalletWithKey() {
      try {
        this.addAccount(this.createWalletWithKey());
        router.push('/')
      } catch (e) {
        console.log(e)
        this.privateKeyError = true;
      }
    },
    addWalletWithPrase() {
      try {
        let hdWallet = this.createWalletWithPrase()
        this.commitWallet(hdWallet)
        let account = hdWallet.deriveChild(0).getWallet()
        this.addAccount(account)
        router.push('/')
      } catch (e) {
        this.hdkeyPraseError = true;
      }
    },
    createWalletWithKey() {
      return EthWallet.fromPrivateKey(new Buffer(this.privateKey, 'hex'));
    },
    createWalletWithPrase() {
      const hdKey = HDKey.fromMasterSeed(this.hdkeyPrase);
      const hdWallet = hdKey.derivePath(this.mnemonic.path);
      return hdWallet;
    }
  }
}
</script>

<style lang="scss">
.menu-list {
  a.is-active {
    background-color: $purple;
  }
}
</style>
