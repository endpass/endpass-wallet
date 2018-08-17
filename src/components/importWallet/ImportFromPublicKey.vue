<template>
  <v-form @submit="addWalletWithAddress">
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

export default {
  name: 'import-from-public-key',
  data: () => ({
    isCreating: false,
    address: '',
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithAddress']),
    async addWalletWithAddress() {
      this.isCreating = true;
      await new Promise(res => setTimeout(res, 20));
      try {
        this.importWalletAddress(this.address);
        router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'address',
          msg: 'Address is invalid',
          id: 'wrongAddress',
        });
        console.error(e);
      }
      this.isCreating = false;
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
