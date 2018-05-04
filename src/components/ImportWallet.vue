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

            <div class="import-private-key" v-if="importType === 'privateKey'" >
              <form>
                <div class="field">
                  <label class="label" for="key">Private key</label>
                  <div class="control">
                    <input v-model="privateKey" :class="{'is-danger' : fields.key && fields.key.touched && fields.key.invalid}" type="text" name="key" class="input" v-validate="'required|private_key'" id="key" aria-describedby="privateKey" placeholder="Private key">
                    <p class="help is-danger">{{errors.first('key')}}</p>
                  </div>
                </div>
                <button class="button is-primary is-medium" :disabled="fields.key && fields.key.invalid" @click.prevent="addWalletWithKey">Import</button>
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
import router from '../router'

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
      router.push('/');
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

<style lang="scss">
.menu-list {
  a.is-active {
    background-color: $purple;
  }
}
</style>
