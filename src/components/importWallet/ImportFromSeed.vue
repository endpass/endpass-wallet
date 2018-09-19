<template>
  <v-form @submit="submitAddWallet">
    <v-input
      id="hdkeySeed"
      key="hdkeyPhraseUnique"
      v-model="key"
      label="Seed phrase"
      name="hdkeyPhrase"
      validator="required|seed_phrase"
      data-vv-as="seed phrase"
      aria-describedby="hdkeyPhrase"
      placeholder="Seed phrase"
      required
      @input="handleInput"
    />
    <v-password
      v-model="password"
      label="Wallet password"
      name="password"
      validator="required|min:8"
      data-vv-as="password"
      aria-describedby="jsonKeystorePassword"
      placeholder="wallet password"
      required
    />
    <v-button
      :loading="isCreating"
      class-name="is-primary is-cta"
    >
      Import
    </v-button>
  </v-form>
</template>

<script>
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VPassword from '@/components/ui/form/VPassword.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  name: 'ImportFromSeed',
  data: () => ({
    isCreating: false,
    key: '',
    password: '',
  }),
  methods: {
    ...mapActions('accounts', ['addMultiHdWallet']),
    async submitAddWallet() {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        this.addMultiHdWallet({
          key: this.key,
          password: this.password,
        });
        this.$router.push('/');
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
    handleInput() {
      this.errors.removeById('wrongPhrase');
    },
  },
  components: {
    VForm,
    VInput,
    VPassword,
    VButton,
  },
};
</script>

<style lang="scss">
</style>
