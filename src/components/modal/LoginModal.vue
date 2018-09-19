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
    async handleLoginByEmailModalConfirm(email) {
      try {
        this.isLoading = true;
        const { redirect_uri: redirectUri } = this.$route.query;
        const challengeType = await this.login({ email, redirectUri });

        if (challengeType === 'otp') {
          this.email = email;
          this.currentModal = TwoFactorAuthModal.name;
        } else if (challengeType === 'email_link') {
          this.currentModal = ConfirmEmailModal.name;
        } else {
          this.handleSuccessfulLogin();
        }
      } catch (e) {
        this.handleFailedLogin(e);
      } finally {
        this.isLoading = false;
      }
    },
    async handleTwoFactorAuthModalConfirm(code) {
      this.isLoading = true;

      try {
        const { email } = this;

        await this.loginViaOTP({ code, email });
        this.handleSuccessfulLogin();
        this.redirectPage();
      } catch (e) {
        this.handleFailedLogin(e);
      } finally {
        this.isLoading = false;
      }
    },
    handleClose() {
      this.close();
    },
    handleSuccessfulLogin() {
      this.close();

      this.$notify({
        title: 'Success',
        type: 'is-info',
        text: 'Logged In',
      });

      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'login_success',
      });
    },
    handleFailedLogin(err) {
      this.emitError(err);
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'login_fail',
      });
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
