<template>
  <v-form>
    <v-input v-model="privateKey"
             label="Private key"
             id="privateKey"
             name="privateKey"
             validator="required|private_key"
             data-vv-as="private key"
             key="privateKeyUnique"
             aria-describedby="privateKey"
             placeholder="Private key"
             required />

    <v-button className="is-primary is-medium"
              :loading="isCreating"
              @click.prevent="addWallet">Import</v-button>
  </v-form>
</template>

<script>
import router from '@/router';
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  name: 'import-from-private-key',
  data: () => ({
    isCreating: false,
    privateKey: '',
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithPrivateKey']),
    async addWallet() {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        this.addWalletWithPrivateKey(this.privateKey);
        router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'privateKey',
          msg: 'Private key is invalid',
          id: 'wrongPrivateKey',
        });
        console.error(e);
      }
      this.isCreating = false;
    }
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
