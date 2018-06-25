<template>
  <v-form>
    <v-input v-model="address"
             label="Address"
             id="address"
             name="address"
             v-validate="'required|address'"
             @input="handleInput"
             data-vv-as="private key"
             key="publicKeyUnique"
             aria-describedby="address"
             placeholder="0x...."
             required />

    <v-button className="is-primary is-medium"
              :loading="isCreating"
              @click.prevent="addWalletWithAddress">Import</v-button>
  </v-form>
</template>

<script>
import AddressWallet from '@/services/addressWallet';
import router from '@/router';
import { mapActions, mapMutations } from 'vuex';
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
    ...mapActions('accounts', ['addAccount']),
    ...mapMutations('accounts', ['setWallet']),
    handleInput() {
      this.errors.removeById('wrongAddress');
      this.$validator.validate();
    },
    async addWalletWithAddress() {
      this.isCreating = true;

      let wallet;

      try {
        wallet = this.createWalletWithAddress();
      } catch (e) {
        this.errors.add({
          field: 'address',
          msg: 'Address is invalid',
          id: 'wrongAddress',
        });
        console.error(e);
      }

      if (wallet) {
        try {
          await this.addAccount(wallet);
          router.push('/');
        } catch (e) {
          console.error(e);
        }
      }

      this.isCreating = false;
    },
    createWalletWithAddress() {
      return new AddressWallet(this.address);
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
