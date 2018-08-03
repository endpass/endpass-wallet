<template>
  <component
    :is="currentModal"
    :is-loading="isLoading"
    v-dynamic-events="['confirm', 'close']"
  />
</template>

<script>
import { mapActions } from 'vuex';

import LoginByEmailModal from '@/components/modal/LoginByEmailModal';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import error from '@/mixins/error';

export default {
  name: 'login-modal',
  data: () => ({
    currentModal: LoginByEmailModal.name,
    isLoading: false,
  }),
  methods: {
    ...mapActions('accounts', ['login', 'loginViaOTP']),
    handleLoginByEmailModalConfirm(email) {
      this.isLoading = true;

      return this.login(email)
        .then(challengeType => {
          if (challengeType === 'otp') {
            this.currentModal = TwoFactorAuthModal.name;
            this.isLoading = false;
          } else {
            this.handleSuccessfulLogin();
          }
        })
        .catch(this.handleFailedLogin);
    },
    handleTwoFactorAuthModalConfirm(code) {
      this.isLoading = true;

      return this.loginViaOTP({ code })
        .then(this.handleSuccessfulLogin)
        .catch(this.handleFailedLogin);
    },
    handleClose() {
      this.close();
    },
    handleSuccessfulLogin() {
      const text = this.currentModal === LoginByEmailModal.name ?
        'Click the link in your email to log in' : 'Authorization was successful';

      this.isLoading = false;
      this.close();

      this.$notify({
        title: 'Success',
        type: 'is-info',
        text,
      });
    },
    handleFailedLogin(error) {
      this.isLoading = false;
      this.emitError(error);
    },
    close() {
      this.$emit('close');
    },
  },
  components: {
    LoginByEmailModal,
    TwoFactorAuthModal,
  },
  mixins: [error],
};
</script>
