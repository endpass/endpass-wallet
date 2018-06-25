<template>
  <v-form>
    <v-input v-model="privateKey"
             label="Private key"
             id="privateKey"
             name="privateKey"
             v-validate="'required|private_key'"
             @input="handleInput"
             data-vv-as="private key"
             key="privateKeyUnique"
             aria-describedby="privateKey"
             placeholder="Private key"
             required />

    <v-button className="is-primary is-medium"
              :loading="isCreating"
              @click.prevent="addWalletWithPrivateKey">Import</v-button>
  </v-form>
</template>

<script>
import EthWallet from 'ethereumjs-wallet';
import router from '@/router';
import { mapActions, mapMutations } from 'vuex';
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
    ...mapActions('accounts', ['addAccount']),
    ...mapMutations('accounts', ['setWallet']),
    handleInput() {
      this.errors.removeById('wrongPrivateKey');
      this.$validator.validate();
    },
    async addWalletWithPrivateKey() {
      this.isCreating = true;

      let wallet;

      try {
        wallet = this.createWalletWithPrivateKey();
      } catch (e) {
        this.errors.add({
          field: 'privateKey',
          msg: 'Private key is invalid',
          id: 'wrongPrivateKey',
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
    createWalletWithPrivateKey() {
      return EthWallet.fromPrivateKey(
        Buffer.from(this.privateKey.replace(/^0x/, ''), 'hex')
      );
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
