<template>
  <v-form>
    <v-input v-model="hdkeyPhrase"
             label="Seed phrase"
             id="hdkeySeed"
             name="hdkeyPhrase"
             v-validate="'required|seed_phrase'"
             @input="handleInput"
             data-vv-as="seed phrase"
             key="hdkeyPhraseUnique"
             aria-describedby="hdkeyPhrase"
             placeholder="Seed phrase"
             required />

    <v-button className="is-primary is-medium"
              :loading="isCreating"
              @click.prevent="addWalletWithPhrase">Import</v-button>
  </v-form>
</template>

<script>
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';
import router from '@/router';
import { mapActions, mapMutations } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  name: 'import-from-seed',
  data: () => ({
    isCreating: false,
    hdkeyPhrase: '',
    mnemonic: {
      // phrase: '', //BIP39 mnemonic
      // seed: '', //Derived from mnemonic phrase
      path: `m/44'/60'/0'/0`, //Derivation path
    },
  }),
  methods: {
    ...mapActions('accounts', ['addAccount']),
    ...mapMutations('accounts', ['setWallet']),
    handleInput() {
      this.errors.removeById('wrongPhrase');
      this.$validator.validate();
    },
    async addWalletWithPhrase() {
      this.isCreating = true;

      let hdWallet;

      try {
        hdWallet = this.createWalletWithPrase();
        this.setWallet(hdWallet);
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
          console.error(e);
        }
      }
      
      this.isCreating = false;
    },
    createWalletWithPrase() {
      const seed = Bip39.mnemonicToSeed(this.hdkeyPhrase);
      const hdKey = HDKey.fromMasterSeed(seed);
      const hdWallet = hdKey.derivePath(this.mnemonic.path);
      return hdWallet;
    },
  },
  components: {
    VForm,
    VInput,
    VButton,
  },
};
</script>

<style lang="scss">
</style>
