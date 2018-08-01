<template>
  <base-page>
    <template slot="title">Login/Register</template>
    <v-form id="login" @submit="handleLogin" v-if="!isSuccess">

      <v-input v-model="email"
               label="Email"
               name="email"
               validator="required|email"
               id="email"
               aria-describedby="email"
               placeholder="Your email"
               :disabled="isSending"/>

      <v-checkbox name="terms" validator="required" v-model="termsAccepted" :disabled="isSending">
        I accept <a href="https://endpass.com/terms/" target="_blank">Terms of Service</a>
        and <a href="https://endpass.com/privacy/" target="_blank">Privacy Policy</a>
      </v-checkbox>

      <v-button id="send-button"
                className="is-primary is-medium"
                :loading="isSending" :disabled="isSending">Send</v-button>

    </v-form>
    <p id="success-message"
       v-else>Click the link in your email to log in</p>

    <two-factor-auth-modal v-if="isTwoFactorAuthModal"
                           @close="toggleTwoFactorAuthModal"
                           @confirm="handleConfirmTwoFactorAuthModal"/>
  </base-page>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import BasePage from '@/components/pages/Base';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VCheckbox from '@/components/ui/form/VCheckbox.vue';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import modalMixin from '@/mixins/modal';
import error from '@/mixins/error';

export default {
  name: 'login-page',
  data: () => ({
    email: '',
    isSending: false,
    isSuccess: false,
    termsAccepted: false,
  }),
  methods: {
    ...mapActions('accounts', ['login', 'loginViaOTP']),
    handleLogin() {
      this.isSending = true;
      this.login(this.email)
        .then(challengeType => {
          if (challengeType === 'otp') {
            this.toggleTwoFactorAuthModal();
            this.isSending = false;
          } else {
            this.handleSuccessfulLogin();
          }
        })
        .catch(this.handleFailedLogin);
    },
    handleConfirmTwoFactorAuthModal(code) {
      this.toggleTwoFactorAuthModal();
      this.isSending = true;

      this.loginViaOTP({ code })
        .then(this.handleSuccessfulLogin)
        .catch(this.handleFailedLogin);
    },
    handleSuccessfulLogin() {
      this.isSending = false;
      this.isSuccess = true;

      this.$notify({
        title: 'Success',
        text: 'Click the link in your email to log in',
        type: 'is-info',
      });
    },
    handleFailedLogin(error) {
      this.isSending = false;
      this.emitError(error);
    }
  },
  components: {
    BasePage,
    VForm,
    VButton,
    VInput,
    VCheckbox,
    TwoFactorAuthModal
  },
  mixins: [error, modalMixin],
};
</script>
