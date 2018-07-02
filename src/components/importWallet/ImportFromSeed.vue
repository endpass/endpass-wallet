<template>
  <v-form>
    <v-input v-model="hdkeyPhrase"
             label="Seed phrase"
             id="hdkeySeed"
             name="hdkeyPhrase"
             validator="'required|seed_phrase'"
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
    hdkeyPhrase: ''
  }),
  methods: {
    ...mapActions('accounts', ['addHdWallet']),
    async addWalletWithPhrase() {
      this.isCreating = true;

      try {
        this.addHdWallet(this.hdkeyPhrase);
        router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'hdkeyPhrase',
          msg: 'Seed phrase is invalid',
          id: 'wrongPhrase',
        });
        console.error(e);
      }

      this.isCreating = false;
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
