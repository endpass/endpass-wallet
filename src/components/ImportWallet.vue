<template>
  <div class="import-wallet app-page">
    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h1 class="card-header-title">Import Existing Wallet</h1>
          </div>
          <div class="card-content">
            <a @click="$router.go(-1)">&lt; Back</a>
            <p class="subtitle">Select the type of wallet you would like to
            import.</p>
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
                    <li>
                      <a @click="importType = 'json'"
                      :class="{'is-active':importType==='json'}">V3 JSON keystore</a>
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
                        <input v-model="privateKey" name="privateKey" v-validate="'required|address'" type="text" class="input" id="privateKey" :class="{'is-danger': fields.privateKey && fields.privateKey.touched && fields.privateKey.invalid }" data-vv-as="private key" aria-describedby="privateKey" placeholder="Private key">
                        <p class="help is-danger">{{errors.first('privateKey')}}</p>
                      </div>
                    </div>
                    <button class="button is-primary is-medium" @click.prevent="addWalletWithKey"
                            :disabled="fields.privateKey && fields.privateKey.invalid">Import</button>
                  </form>
                </div>

                <div class="import-private-key" v-if="importType === 'publicKey'">
                  <form>
                    <div class="field">
                      <label class="label" for="privateKey">Public key</label>
                      <div class="control">
                        <input v-model="privateKey" name="privateKey" v-validate="'required|address'" type="text" class="input" id="privateKey" :class="{'is-danger': fields.privateKey && fields.privateKey.touched && fields.privateKey.invalid }" data-vv-as="private key" aria-describedby="privateKey" placeholder="Private key">
                        <p class="help is-danger">{{errors.first('privateKey')}}</p>
                      </div>
                    </div>
                    <button class="button is-primary is-medium" @click.prevent="addWalletWithKey"
                            :disabled="fields.privateKey && fields.privateKey.invalid">Import</button>
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
                <div class="import-json" v-if="importType ===
                'json'">
                  <form>
                    <div class="field">

                      <div class="file">
                        <label class="file-label">
                          <input class="file-input" type="file"
                                                    name="jsonWallet" @change="setFile">
                          <span class="file-cta">
                            <span class="file-icon">
                              <span class="icon is-small"
                                    v-html="require('@/img/arrow-thick-top.svg')"></span>
                            </span>
                            <span class="file-label">
                              {{ fileName || 'V3 JSON keystore file'}}
                            </span>
                          </span>
                        </label>
                      </div>
                      <p v-show="jsonKeystoreError" class="help is-danger">File is invalid</p>
                    </div>
                    <div class="field">
                      <label class="label" for="jsonKeystorePassword">V3 JSON keystore password</label>
                      <div class="control">
                        <input v-model="jsonKeystorePassword"
                               @change="(jsonKeystorePasswordError = false)"
                               type="password" class="input" id="jsonKeystorePassword"
                                                             aria-describedby="jsonKeystorePassword" placeholder="V3 JSON keystore password">
                        <p v-show="jsonKeystorePasswordError" class="help is-danger">JSON password is invalid</p>
                      </div>
                    </div>
                    <button class="button is-primary is-medium"
                            @click.prevent="parseJson" :disabled="!jsonKeystorePassword">Import</button>
                  </form>
                </div>
              </div>

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
      jsonPassword: '',
      fileName: '',
      file: null,
      privateKeyError: false,
      hdkeyPraseError: false,
      jsonKeystoreError: false,
      jsonKeystorePassword: '',
      jsonKeystorePasswordError: false,
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
        this.privateKeyError = true;
        console.error(e);
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
        console.error(e);
      }
    },
    createWalletWithKey() {
      return EthWallet.fromPrivateKey(new Buffer(this.privateKey, 'hex'));
    },
    createWalletWithPrase() {
      const hdKey = HDKey.fromMasterSeed(this.hdkeyPrase);
      const hdWallet = hdKey.derivePath(this.mnemonic.path);
      return hdWallet;
    },
    parseJson() {
      var reader = new FileReader();
      reader.onload = this.addWalletWithJson.bind(this);
      reader.readAsText(this.file);
    },
    addWalletWithJson(e) {
      try {
        let account = this.createWalletWithJson(e);
        this.addAccount(account);
        router.push('/')
      } catch (e) {
        if(e.message === 'Not a V3 wallet') {
          this.jsonKeystoreError = true;
        } else {
          this.jsonKeystorePasswordError = true;
        }
      }
    },
    createWalletWithJson(e) {
      return EthWallet.fromV3(e.target.result, this.jsonKeystorePassword);
    },
    setFile(e) {
      this.jsonKeystoreError = false;
      if(e.target.files[0]) {
        this.fileName = e.target.files[0].name;
        this.file = e.target.files[0];
      } else {
        this.fileName = '';
        this.file = null;
      }
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
