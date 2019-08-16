<template>
  <div>
    <v-form
      :is-form-valid="isFormValid"
      data-test="update-email-form"
      @submit="togglePasswordModal"
    >
      <label class="label">{{$t('components.emailUpdate.header')}}</label>
      <v-input
        ref="email"
        v-model="email"
        v-validate="'required|email'"
        :error="errors.first('email')"
        :disabled="isLoading"
        name="email"
        :placeholder="$t('components.emailUpdate.newEmail')"
        :data-vv-as="$t('components.emailUpdate.newEmail')"
        data-test="input-new-email"
      />
      <v-input
        v-model="emailConfirm"
        v-validate="'required|email|confirmed:email'"
        :error="errors.first('emailConfirm')"
        :disabled="isLoading"
        name="emailConfirm"
        :placeholder="$t('components.emailUpdate.confirmEmail')"
        :data-vv-as="$t('components.emailUpdate.confirmEmail')"
        data-test="input-confirm-new-email"
      />
      <v-button
        ref="button"
        :loading="isLoading"
        :disabled="!isFormValid"
        class-name="is-primary is-medium"
        data-test="update-email-button"
      >
        {{$t('global.update')}}Update
      </v-button>
    </v-form>
    <password-modal
      v-if="isPasswordModal"
      @confirm="confirm"
      @close="togglePasswordModal"
    >
      <div class="field">
        <label class="label">{{$t('components.emailUpdate.emailWillBeUpdatedTo')}</label>
        <p>{{ email }}</p>
      </div>
    </password-modal>
  </div>
</template>

<script>
import error from '@/mixins/error';
import form from '@/mixins/form';
import { mapActions } from 'vuex';
import modalMixin from '@/mixins/modal';
import PasswordModal from '@/components/modal/PasswordModal';

export default {
  name: 'EmailUpdate',
  data: () => ({
    email: '',
    emailConfirm: '',
    isLoading: false,
  }),
  methods: {
    ...mapActions('user', ['updateEmail']),
    async confirm(password) {
      this.isLoading = true;
      await this.updateEmail({ email: this.email, password });
      this.togglePasswordModal();
      this.email = null;
      this.emailConfirm = null;
      this.$validator.reset();
      this.isLoading = false;
    },
  },
  mixins: [error, form, modalMixin],
  components: {
    PasswordModal,
  },
};
</script>
