<template>
  <v-form @submit="addWalletWithPhrase">
    <v-input v-model="hdkeyPhrase"
             label="Seed phrase"
             id="hdkeySeed"
             name="hdkeyPhrase"
             validator="required|seed_phrase"
             data-vv-as="seed phrase"
             key="hdkeyPhraseUnique"
             aria-describedby="hdkeyPhrase"
             placeholder="Seed phrase"
             required />
     <v-input v-model="walletPassword"
              label="Wallet password"
              id="jsonKeystorePassword"
              name="walletPassword"
              type="password"
              validator="required|min:8"
              data-vv-as="password"
              aria-describedby="jsonKeystorePassword"
              placeholder="wallet password"
              required />
    <v-button className="is-primary is-cta"
              :loading="isCreating">Import</v-button>
  </v-form>
</template>

<script>
import router from '@/router';
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  name: 'import-from-seed',
  data: () => ({
    isCreating: false,
    hdkeyPhrase: '',
    walletPassword: '',
  }),
  methods: {
    ...mapActions('accounts', ['addHdWallet']),
    async addWalletWithPhrase() {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        this.addHdWallet({
          key: this.hdkeyPhrase,
          password: this.walletPassword,
        });
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
