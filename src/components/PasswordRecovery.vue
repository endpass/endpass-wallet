<template>
  <div>
    <v-form
      :is-form-valid="isFormValid"
      @submit="toggleConfirmModal"
      data-test="password-recovery-form"
    >
      <label class="label">Password Recovery</label>
      <v-input
        v-validate="'required|seed_phrase'"
        v-model="seedPhrase"
        :error="errors.first('seedPhrase')"
        :disabled="isLoading"
        name="seedPhrase"
        placeholder="Seed phrase"
        data-test="input-seed-phrase"
      />
      <v-password
        v-validate="'required|min:8'"
        v-model="password"
        :error="errors.first('password')"
        :disabled="isLoading"
        name="password"
        placeholder="New password"
        data-test="input-password"
      />
      <v-button
        ref="button"
        :loading="isLoading"
        :disabled="!isFormValid"
        class-name="is-primary is-medium"
        data-test="recover-button"
      >
        Recover
      </v-button>
    </v-form>

    <confirm-modal
      v-if="isConfirmModal"
      @confirm="handleConfirm"
      @close="toggleConfirmModal"
    >
      <p class="subtitle">
        All keystore wallets will be deleted. They can be restored from a
        private key or seed phrase on the import page.
      </p>
    </confirm-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import ConfirmModal from '@/components/modal/ConfirmModal';
import formMixin from '@/mixins/form';
import modalMixin from '@/mixins/modal';

export default {
  name: 'PasswordRecovery',
  data: () => ({
    seedPhrase: null,
    password: null,
    isLoading: false,
  }),
  methods: {
    ...mapActions('accounts', ['recoverWalletsPassword']),
    async handleConfirm() {
      try {
        this.isLoading = true;
        this.toggleConfirmModal();

        await this.recoverWalletsPassword({
          seedPhrase: this.seedPhrase,
          password: this.password,
        });
      } catch (error) {
        this.$notify({
          title: 'Error recovering wallet password',
          text:
            'An error occurred while recovering wallet password. Please try again.',
          type: 'is-danger',
        });
      } finally {
        this.seedPhrase = null;
        this.password = null;
        this.isLoading = false;
      }
    },
  },
  mixins: [formMixin, modalMixin],
  components: {
    ConfirmModal,
  },
};
</script>
