<template>
  <v-form
    data-test="import-public-form"
    @submit="submitAddWallet"
    :isFormValid="isFormValid">
    <v-input
      id="address"
      key="publicKeyUnique"
      v-model="address"
      label="Address"
      name="address"
      data-vv-name="address"
      v-validate="'required|address'"
      :error="errors.first('address')"
      data-vv-as="public key"
      aria-describedby="address"
      placeholder="0x...."
      required
      data-test="input-public-key"
      @input="handleInput"
    />
    <v-button
      :loading="isCreating"
      class-name="is-primary is-cta"
      data-test="submit-import"
      :disabled="!isFormValid"
    >
      Import
    </v-button>
  </v-form>
</template>

<script>
import { mapActions } from 'vuex';
import formMixin from '@/mixins/form';

export default {
  name: 'ImportFromPublicKey',
  data: () => ({
    isCreating: false,
    address: '',
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithPublicKey']),
    async submitAddWallet() {
      this.isCreating = true;
      try {
        await this.addWalletWithPublicKey(this.address);
        this.$router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'address',
          msg: 'Address is invalid',
          id: 'wrongAddress',
        });
        console.error(e);
      } finally {
        this.isCreating = false;
      }
    },
    handleInput() {
      this.errors.removeById('wrongAddress');
    },
  },
  mixins: [formMixin],
};
</script>

<style lang="scss">
</style>
