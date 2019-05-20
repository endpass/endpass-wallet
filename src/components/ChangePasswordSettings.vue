<template>
  <v-form
    :is-form-valid="isFormValid"
    @submit="handleFormSubmit"
  >
    <label class="label">Change Password</label>
    <v-password
      v-model="oldPassword"
      v-validate="'required|min:8'"
      :disabled="isLoading"
      :error="errors.first('oldPassword')"
      name="oldPassword"
      data-vv-name="oldPassword"
      data-vv-as="Old Password"
      placeholder="Old Password"
      data-test="input-old-password"
    />
    <v-password
      v-model="newPassword"
      v-validate="'required|min:8'"
      :disabled="isLoading"
      :error="errors.first('newPassword')"
      name="newPassword"
      data-vv-name="newPassword"
      data-vv-as="New Password"
      placeholder="New Password"
      data-test="input-new-password"
    />
    <v-button
      :loading="isLoading"
      :disabled="!isFormValid"
      class-name="is-primary is-medium"
      data-test="submit-change-password"
    >
      Change Password
    </v-button>
  </v-form>
</template>

<script>
import { mapActions } from 'vuex';
import { matchString } from '@endpass/utils/strings';
import formMixin from '@/mixins/form';

export default {
  name: 'ChangePasswordSettings',

  data: () => ({
    isLoading: false,
    oldPassword: null,
    newPassword: null,
  }),

  methods: {
    ...mapActions('accounts', [
      'updateWallets',
      'updateWalletsWithNewPassword',
    ]),

    async handleFormSubmit() {
      try {
        this.isLoading = true;

        const res = await this.updateWalletsWithNewPassword({
          password: this.oldPassword,
          newPassword: this.newPassword,
        });

        if (!res) {
          this.handleSubmitError();
        } else {
          this.$notify({
            title: 'Password changed successfully',
            type: 'is-success',
          });
          this.oldPassword = null;
          this.newPassword = null;
        }
      } catch (err) {
        this.handleSubmitError(err.message);
      } finally {
        this.isLoading = false;
      }
    },

    handleSubmitError(err) {
      const isIncorrentPasswordError = matchString(
        err,
        'authentication code mismatch',
      );

      this.$notify({
        title: isIncorrentPasswordError
          ? 'You entered incorrect password, try using a different one.'
          : 'Password was not changed.',
        type: 'is-danger',
      });
    },
  },
  mixins: [formMixin],
};
</script>
