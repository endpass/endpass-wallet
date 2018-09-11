<template>
  <v-form @submit="addWallet">
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
      @input="handleInput"
    />
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
import { SET_ADDRESS } from '@/store/accounts/mutations-types';

export default {
  name: 'import-from-public-key',
  data: () => ({
    isCreating: false,
    address: '',
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithPublicKey']),
    async addWallet() {
      this.isCreating = true;
      try {
        await this.addWalletWithPublicKey(this.address);
        router.push('/');
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
