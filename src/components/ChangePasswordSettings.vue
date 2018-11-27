<template>
  <v-form @submit="handleFormSubmit">
    <label class="label">Change Password</label>
    <v-password
      v-model="oldPassword"
      :disabled="isLoading"
      name="oldPassword"
      validator="required|min:8"
      data-vv-as="Old Password"
      placeholder="Old Password"
      data-test="input-old-password"
    />
    <v-password
      v-model="newPassword"
      :disabled="isLoading"
      name="newPassword"
      validator="required|min:8"
      data-vv-as="New Password"
      placeholder="New Password"
      data-test="input-new-password"
    />
    <v-button
      :loading="isLoading"
      class-name="is-primary is-medium"
      data-test="submit-change-password"
    >Change Password</v-button>
  </v-form>
</template>

<script>
import { mapActions } from 'vuex';
import { matchString } from '@/utils/strings';
import VForm from '@/components/ui/form/VForm';
import VButton from '@/components/ui/form/VButton';
import VPassword from '@/components/ui/form/VPassword';

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
      'updateAllAccountWalletsWithNewPassword',
    ]),

    async handleFormSubmit() {
      try {
        this.isLoading = true;

        const res = await this.updateAllAccountWalletsWithNewPassword({
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
          : 'Password was not changed',
        type: 'is-danger',
      });
    },
  },

  components: {
    VForm,
    VButton,
    VPassword,
  },
};
</script>
