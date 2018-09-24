<template>
  <div>
    <v-form
      data-test="import-private-form"
      @submit="togglePasswordModal"
    >
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
        data-test="input-private-key"
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

    <password-modal
      v-if="isPasswordModal"
      @close="togglePasswordModal"
      @confirm="handlePasswordConfirm"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm';
import VPassword from '@/components/ui/form/VPassword';
import VButton from '@/components/ui/form/VButton';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';

export default {
  name: 'ImportFromPrivateKey',
  data: () => ({
    isCreating: false,
    privateKey: '',
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithPrivateKey']),
    async handlePasswordConfirm(password) {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        this.addWalletWithPrivateKey({
          privateKey: this.privateKey.replace(/^0x/, ''),
          password,
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
  mixins: [modalMixin],
  components: {
    VForm,
    VPassword,
    VButton,
    PasswordModal,
  },
};
</script>

<style lang="scss">
</style>
