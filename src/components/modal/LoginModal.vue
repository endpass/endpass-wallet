<template>
  <component
    v-dynamic-events="['confirm', 'close']"
    :is="currentModal"
    :is-loading="isLoading"
    class="login-modal"
    data-test="login-modal"
  />
</template>

<script>
import { mapActions } from 'vuex';

import LoginByEmailModal from '@/components/modal/LoginByEmailModal';
import ConfirmEmailModal from '@/components/modal/ConfirmEmailModal';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import error from '@/mixins/error';

export default {
  name: 'LoginModal',
  data: () => ({
    currentModal: LoginByEmailModal.name,
    isLoading: false,
    email: null,
  }),
  methods: {
    ...mapActions('user', ['login', 'loginViaOTP']),
    handleLoginByEmailModalConfirm(email) {
      this.isLoading = true;

      return this.login(email)
        .then(challengeType => {
          if (challengeType === 'otp') {
            this.email = email;
            this.currentModal = TwoFactorAuthModal.name;
            this.isLoading = false;
          } else if (challengeType === 'email_link') {
            this.currentModal = ConfirmEmailModal.name;
            this.isLoading = false;
          } else {
            this.handleSuccessfulLogin();
          }
        })
        .catch(this.handleFailedLogin);
    },
    handleTwoFactorAuthModalConfirm(code) {
      this.isLoading = true;
      const {
        email,
        handleFailedLogin,
        handleSuccessfulLogin,
        loginViaOTP,
      } = this;

      return loginViaOTP({ code, email })
        .then(handleSuccessfulLogin)
        .then(this.redirectPage)
        .catch(handleFailedLogin);
    },
    handleClose() {
      this.close();
    },
    handleSuccessfulLogin() {
      this.isLoading = false;
      this.close();

      this.$notify({
        title: 'Success',
        type: 'is-info',
        text: 'Logged In',
      });
    },
    handleFailedLogin(error) {
      this.isLoading = false;
      this.emitError(error);
    },
    close() {
      this.$emit('close');
    },
    redirectPage() {
      const regirectUri = this.$route.query.redirect_uri;

      if (regirectUri) {
        this.$router.push({
          path: regirectUri,
        });
      }
    },
  },
  mixins: [error],
  components: {
    LoginByEmailModal,
    ConfirmEmailModal,
    TwoFactorAuthModal,
  },
};
</script>
