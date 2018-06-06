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
                      :class="{'is-active':importType === 'seedPhrase'}">Seed Phrase</a>
                    </li>
                    <li>
                      <a @click="importType = 'privateKey'"
                      :class="{'is-active':importType === 'privateKey'}">Private
                      Key</a>
                    </li>
                    <li>
                      <a @click="importType = 'json'"
                      :class="{'is-active':importType === 'json'}">V3 JSON keystore</a>
                    </li>
                    <li>
                      <a @click="importType = 'publicKey'"
                      :class="{'is-active':importType==='publicKey'}">Public
                      Key</a>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="column">
                <div class="import-publc-key" v-if="importType === 'publicKey'">
                  <form>
                    <div class="field">
                      <label class="label" for="publicKey">Public key</label>
                      <div class="control">
                        <input
                          v-model="publicKey"
                          name="publicKey" v-validate="'required|public_key'"
                          type="text"
                          class="input"
                          id="publicKey"
                          :class="{'is-danger': errors.has('privateKey') }"
                          data-vv-as="public key"
                          aria-describedby="publicKey"
                          placeholder="Public key">
                        <p v-show="errors.has('privateKey')"
                          class="help is-danger">{{errors.first('publicKey')}}</p>
                      </div>
                    </div>
                    <button
                        class="button is-primary is-medium"
                        @click.prevent="addWalletWithPublicKey"
                        :disabled="!isFormValid"
                        >Import</button>
                  </form>
                </div>
                <div class="import-private-key" v-if="importType === 'privateKey'">
                  <form>
                    <div class="field">
                      <label class="label" for="private-key">Private key</label>
                      <div class="control">
                        <input
                          v-model="privateKey"
                          type="text"
                          class="input"
                          :class="{'is-danger': errors.has('privateKey') }"
                          v-validate="'required|private_key'"
                          data-vv-as="private key"
                          key="privateKeyUnique"
                          name="privateKey"
                          id="privateKey"
                          aria-describedby="privateKey"
                          placeholder="Private key">
                        <p v-show="errors.has('privateKey')"
                          class="help is-danger">{{ errors.first('privateKey') }}
                        </p>
                      </div>
                    </div>
                    <button
                      class="button is-primary is-medium"
                      @click.prevent="addWalletWithPrivateKey"
                      :disabled="!isFormValid"
                      >Import</button>
                  </form>
                </div>

                <div class="import-seed-phrase" v-if="importType ===
                'seedPhrase'">
                  <form>
                    <div class="field">
                      <label class="label" for="hdkeySeed">Seed phrase</label>
                      <div class="control">
                        <input
                          v-model="hdkeyPhrase"
                          type="text"
                          class="input"
                          :class="{'is-danger': errors.has('hdkeyPhrase') }"
                          v-validate="'required|seed_phrase'"
                          data-vv-as="seed phrase"
                          key="hdkeyPhraseUnique"
                          name="hdkeyPhrase"
                          id="hdkeySeed"
                          aria-describedby="hdkeyPhrase"
                          placeholder="Seed phrase">
                        <p v-show="errors.has('hdkeyPhrase')"
                          class="help is-danger">{{ errors.first('hdkeyPhrase') }}</p>
                      </div>
                    </div>
                    <button
                      class="button is-primary is-medium"
                      @click.prevent="addWalletWithPhrase"
                      :disabled="!isFormValid">Import</button>
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
                      <p v-show="errors.has('fileName')"
                        class="help is-danger">{{ errors.first('fileName') }}</p>
                    </div>
                    <div class="field">
                      <label class="label" for="jsonKeystorePassword">V3 JSON keystore password</label>
                      <div class="control">
                        <input
                          v-model="jsonKeystorePassword"
                          @input="errors.removeById('wrongPass')"
                          type="password"
                          class="input"
                          :class="{'is-danger': errors.has('jsonKeystorePassword') }"
                          v-validate="'required|min:8'"
                          data-vv-as="password"
                          key="jsonKeystorePasswordUnique"
                          name="jsonKeystorePassword"
                          id="jsonKeystorePassword"
                          aria-describedby="jsonKeystorePassword"
                          placeholder="V3 JSON keystore password">
                        <p v-show="errors.has('jsonKeystorePassword')"
                          class="help is-danger">{{ errors.first('jsonKeystorePassword') }}</p>
                      </div>
                    </div>
                    <button
                      class="button is-primary is-medium"
                      @click.prevent="parseJson"
                      :disabled="!isFormValid">Import</button>
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
import EthWallet from 'ethereumjs-wallet';
import HDKey from 'ethereumjs-wallet/hdkey';
import router from '@/router';
import { mapMutations, mapActions } from 'vuex';

export default {
  data: () => ({
    privateKey: '',
    publicKey: '',
    hdkeyPhrase: '',
    jsonPassword: '',
    fileName: '',
    file: null,
    jsonKeystorePassword: '',
    importType: 'seedPhrase',
    mnemonic: {
      phrase: '', //BIP39 mnemonic
      seed: '', //Derived from mnemonic phrase
      path: `m/44'/60'/0'/0`, //Derivation path
    },
  }),
  computed: {
    isFormValid() {
      const hasInvalidField = Object.keys(this.fields).some(
        field => this.fields[field] && this.fields[field].invalid
      );

      return !(hasInvalidField || this.errors.count());
    },
  },
  methods: {
    ...mapMutations('accounts', {
      commitWallet: 'setWallet',
    }),
    ...mapActions('accounts', ['addAccount']),
    async addWalletWithPublicKey() {
      let wallet;

      try {
        wallet = this.createWalletWithPublicKey();
      } catch (e) {
        this.errors.add({
          field: 'publicKey',
          msg: 'Public key is invalid',
          id: 'wrongPublicKey',
        });
        console.error(e);
      }

      if (wallet) {
        try {
          await this.addAccount(wallet);
          router.push('/');
        } catch (e) {
          this.$notify({
            title: e.title,
            text: e.text,
            type: 'is-warning',
          });
          console.error(e);
        }
      }
    },
    async addWalletWithPrivateKey() {
      let wallet;

      try {
        wallet = this.createWalletWithPrivateKey();
      } catch (e) {
        this.errors.add({
          field: 'privateKey',
          msg: 'Private key is invalid',
          id: 'wrongPrivateKey',
        });
        console.error(e);
      }

      if (wallet) {
        try {
          await this.addAccount(wallet);
          router.push('/');
        } catch (e) {
          this.$notify({
            title: e.title,
            text: e.text,
            type: 'is-warning',
          });
          console.error(e);
        }
      }
    },
    async addWalletWithPhrase() {
      let hdWallet;

      try {
        hdWallet = this.createWalletWithPrase();
        this.commitWallet(hdWallet);
      } catch (e) {
        this.errors.add({
          field: 'hdkeyPhrase',
          msg: 'Seed phrase is invalid',
          id: 'wrongPhrase',
        });
        console.error(e);
      }

      if (hdWallet) {
        try {
          const account = hdWallet.deriveChild(0).getWallet();
          await this.addAccount(account);
          router.push('/');
        } catch (e) {
          this.$notify({
            title: e.title,
            text: e.text,
            type: 'is-warning',
          });
          console.error(e);
        }
      }
    },
    createWalletWithPrivateKey() {
      return EthWallet.fromPrivateKey(Buffer.from(this.privateKey, 'hex'));
    },

    createWalletWithPublicKey() {
      return EthWallet.fromPublicKey(Buffer.from(this.publicKey, 'hex'));
    },
    createWalletWithPrase() {
      const hdKey = HDKey.fromMasterSeed(this.hdkeyPhrase);
      const hdWallet = hdKey.derivePath(this.mnemonic.path);
      return hdWallet;
    },
    parseJson() {
      const reader = new FileReader();
      reader.onload = this.addWalletWithJson.bind(this);
      reader.readAsText(this.file);
    },
    async addWalletWithJson(e) {
      let wallet;

      try {
        wallet = this.createWalletWithJson(e);
      } catch (e) {
        let error = {
          field: 'jsonKeystorePassword',
          msg: 'JSON password is invalid',
          id: 'wrongPass',
        };

        if (
          e.message === 'Not a V3 wallet' ||
          e.message.includes('Unexpected token')
        ) {
          error = {
            field: 'fileName',
            msg: 'File is invalid',
            id: 'wrongFile',
          };
        }

        this.errors.add(error);
        console.error(e);
      }

      if (wallet) {
        try {
          await this.addAccount(wallet);
          router.push('/');
        } catch (e) {
          this.$notify({
            title: e.title,
            text: e.text,
            type: 'is-warning',
          });
          console.error(e);
        }
      }
    },
    createWalletWithJson(e) {
      return EthWallet.fromV3(e.target.result, this.jsonKeystorePassword, true);
    },
    setFile(e) {
      this.errors.removeById('wrongFile');

      if (e.target.files[0]) {
        this.fileName = e.target.files[0].name;
        this.file = e.target.files[0];
      } else {
        this.fileName = '';
        this.file = null;
      }
    },
  },
  watch: {
    importType() {
      this.errors.removeById('wrongFile');
      this.errors.removeById('wrongPass');
      this.errors.removeById('wrongPhrase');
      this.errors.removeById('wrongKey');

      this.$nextTick().then(() => {
        const activeField = Object.keys(this.fields).find(v => !!v);

        if (activeField && this.$data[activeField]) {
          this.$validator.validate();
        }
      });
    },
  },
};
</script>

<style lang="scss">
.menu-list {
  a.is-active {
    background-color: $purple;
  }
}
</style>
