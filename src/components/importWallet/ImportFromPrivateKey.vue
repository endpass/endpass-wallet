<template>
  <v-form @submit="submitAddWallet">
    <v-password
      id="privateKey"
      key="privateKeyUnique"
      v-model="privateKey"
      label="Private key"
      name="privateKey"
      validator="required|private_key"
      data-vv-as="private key"
      aria-describedby="privateKey"
      placeholder="Private key"
      required
      @input="handleInput"
    />
     <v-password v-model="password"
              label="Wallet password"
              id="jsonKeystorePassword"
              name="walletPassword"
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
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VPassword from '@/components/ui/form/VPassword.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  name: 'import-from-private-key',
  data: () => ({
    isCreating: false,
    privateKey: '',
    password: '',
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithPrivateKey']),
    async submitAddWallet() {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        this.addWalletWithPrivateKey({
          privateKey: this.privateKey.replace(/^0x/, ''),
          password: this.password,
        });
        this.$router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'privateKey',
          msg: 'Private key is invalid',
          id: 'wrongPrivateKey',
        });
        console.error(e);
      }
      this.isCreating = false;
    },
    handleInput() {
      this.errors.removeById('wrongPrivateKey');
    },
  },
  components: {
    VForm,
    VPassword,
    VButton,
  },
};
</script>

<style lang="scss">
</style>
