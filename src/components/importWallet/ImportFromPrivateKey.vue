<template>
  <div>
    <v-form
      :is-form-valid="isFormValid"
      data-test="import-private-form"
      @submit="togglePasswordModal"
    >
      <v-password
        id="privateKey"
        key="privateKeyUnique"
        v-model="privateKey"
        v-validate="'required|private_key'"
        :error="errors.first('privateKey')"
        :label="$t('components.importFromPrivateKey.privateKey')"
        name="privateKey"
        data-vv-name="privateKey"
        :data-vv-as="$t('components.importFromPrivateKey.privateKey')"
        aria-describedby="privateKey"
        :placeholder="$t('components.importFromPrivateKey.privateKey')"
        required
        data-test="input-private-key"
        @input="handleInput"
      />

      <v-button
        :loading="isCreating"
        :disabled="!isFormValid"
        class-name="is-primary is-cta"
        data-test="submit-import"
      >
        {{$t('global.import')}}
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
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';
import formMixin from '@/mixins/form';

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
          msg: this.$t('components.importFromPrivateKey.privateKeyInvalid'),
          id: 'wrongPrivateKey',
        });
        /* eslint-disable-next-line no-console */
        console.error(e);
      }
      this.isCreating = false;
    },
    handleInput() {
      this.errors.removeById('wrongPrivateKey');
    },
  },
  mixins: [modalMixin, formMixin],
  components: {
    PasswordModal,
  },
};
</script>

<style lang="scss"></style>
