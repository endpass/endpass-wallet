<template>
  <v-form
    data-test="import-public-form"
    @submit="submitAddWallet"
  >
    <v-input
      id="address"
      key="publicKeyUnique"
      v-model="address"
      label="Address"
      name="address"
      validator="required|address"
      data-vv-as="private key"
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
    >
      Import
    </v-button>
  </v-form>
</template>

<script>
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import { SET_ADDRESS } from '@/store/accounts/mutations-types';

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
  components: {
    VForm,
    VInput,
    VButton,
  },
};
</script>

<style lang="scss">
</style>
