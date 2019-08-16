<template>
  <v-form
    :is-form-valid="isFormValid"
    @submit="handleFormSubmit"
  >
    <label class="label">{{$t('components.changePassword.header')}}</label>
    <v-password
      v-model="oldPassword"
      v-validate="'required|min:8'"
      :disabled="isLoading"
      :error="errors.first('oldPassword')"
      name="oldPassword"
      data-vv-name="oldPassword"
      :data-vv-as="$t('components.changePassword.oldPassword')"
      :placeholder="$t('components.changePassword.oldPassword')"
      data-test="input-old-password"
    />
    <v-password
      v-model="newPassword"
      v-validate="'required|min:8'"
      :disabled="isLoading"
      :error="errors.first('newPassword')"
      name="newPassword"
      data-vv-name="newPassword"
      :data-vv-as="$t('components.changePassword.newPassword')"
      :placeholder="$t('components.changePassword.newPassword')"
      data-test="input-new-password"
    />
    <v-button
      :loading="isLoading"
      :disabled="!isFormValid"
      class-name="is-primary is-medium"
      data-test="submit-change-password"
    >
      {{$t('components.changePassword.changePassword')}}
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
            title: this.$t('components.changePassword.changerSuccess'),
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
          ? $t('components.changePassword.incorrectPassword')
          : $t('components.changePassword.passwordNotChanged'),
        type: 'is-danger',
      });
    },
  },
  mixins: [formMixin],
};
</script>
