<template>
  <v-form
    :is-form-valid="isFormValid"
    @submit="handleSubmit"
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
</template>

<script>
import { mapActions } from 'vuex';

import formMixin from '@/mixins/form';

export default {
  name: 'PasswordRecovery',

  data: () => ({
    seedPhrase: null,
    password: null,
    isLoading: false,
  }),

  methods: {
    ...mapActions('accounts', ['recoverWalletsPassword']),
    async handleSubmit() {
      try {
        this.isLoading = true;

        const success = await this.recoverWalletsPassword({
          seedPhrase: this.seedPhrase,
          password: this.password,
        });

        if (success) {
          this.$notify({
            title: 'The password is successfully recovered',
            type: 'is-success',
          });
        } else if (success === false) {
          this.handleSubmitError();
        }
      } catch (error) {
        this.handleSubmitError();
      } finally {
        this.seedPhrase = null;
        this.password = null;
        this.isLoading = false;
      }
    },

    handleSubmitError() {
      this.$notify({
        title: 'Error recovering wallet password',
        text:
          'An error occurred while recovering wallet password. Please try again.',
        type: 'is-danger',
      });
    },
  },
  mixins: [formMixin],
};
</script>
