<template>
  <div>
    <wallets-list
      v-if="isListVisible"
      :type="walletType"
      :auto-load="true"
    />
    <v-form
      v-else
      :is-form-valid="isFormValid"
      data-test="import-seed-form"
      @submit="togglePasswordModal"
    >
      <v-input
        v-validate="'required|seed_phrase'"
        id="hdkeySeed"
        key="hdkeyPhraseUnique"
        v-model="key"
        :error="errors.first('hdkeyPhrase')"
        label="Seed phrase"
        name="hdkeyPhrase"
        data-vv-name="hdkeyPhrase"
        data-vv-as="seed phrase"
        aria-describedby="hdkeyPhrase"
        placeholder="Seed phrase"
        required
        data-test="input-seed-phrase"
        @input="handleInput"
      />

      <v-button
        :loading="isCreating"
        :disabled="!isFormValid"
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
import VInput from '@/components/ui/form/VInput';
import VButton from '@/components/ui/form/VButton';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';
import formMixin from '@/mixins/form';
import { WALLET_TYPE } from '@/constants';
import WalletsList from './WalletsList';

export default {
  name: 'ImportFromSeed',
  data: () => ({
    isListVisible: false,
    isCreating: false,
    isPasswordModal: false,
    key: '',
    walletType: WALLET_TYPE.HD_PUBLIC,
  }),
  methods: {
    ...mapActions('accounts', ['addHdPublicWallet']),
    async handlePasswordConfirm(password) {
      this.isCreating = true;
      this.isPasswordModal = false;

      await new Promise(res => setTimeout(res, 20));

      try {
        await this.addHdPublicWallet({
          key: this.key,
          password,
        });
        this.isListVisible = true;
      } catch (e) {
        this.errors.add({
          field: 'hdkeyPhrase',
          msg: 'Seed phrase is invalid',
          id: 'wrongPhrase',
        });
      } finally {
        this.isCreating = false;
      }
    },
    handleInput() {
      this.errors.removeById('wrongPhrase');
    },
  },
  mixins: [modalMixin, formMixin],
  components: {
    VForm,
    VInput,
    VButton,
    PasswordModal,
    WalletsList,
  },
};
</script>

<style lang="scss">
</style>
