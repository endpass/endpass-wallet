<template>
  <div>
    <v-form @submit="onFormSubmit">
      <label class="label">Two Factor Authentication</label>
      <v-button
        :disabled="isButtonDisabled"
        :loading="isLoading"
        class-name="is-primary is-medium"
        data-test="button-two-factor"
      >
        {{ otpSettings.secret ? 'Enable' : 'Disable' }} Two Factor Auth
      </v-button>
    </v-form>
    <two-factor-auth-modal
      v-if="isTwoFactorAuthModal"
      :secret="otpSettings.secret"
      :email="email"
      :is-loading="isLoading"
      @request-code="sendVerificationCode"
      @close="toggleTwoFactorAuthModal"
      @confirm="onConfirmTwoFactorAuthModal"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import modalMixin from '@/mixins/modal';

export default {
  name: 'TwoFactorAuthSettings',

  data: () => ({
    isLoading: false,
  }),

  computed: {
    ...mapState('user', ['email', 'otpSettings']),

    isButtonDisabled() {
      return !this.otpSettings.secret && !this.otpSettings.status;
    },

    isOtpEnabled() {
      return !!this.otpSettings.status;
    },
  },

  methods: {
    ...mapActions('user', [
      'getOtpSettings',
      'setOtpSettings',
      'deleteOtpSettings',
      'sendCode',
    ]),
    ...mapActions('errors', ['emitError']),

    async onConfirmTwoFactorAuthModal({ code, verificationCode }) {
      const { secret } = this.otpSettings;

      this.toggleTwoFactorAuthModal();
      this.isLoading = true;

      try {
        if (secret) {
          await this.setOtpSettings({ secret, code, verificationCode });
        } else {
          await this.deleteOtpSettings({ code });
        }

        this.$notify({
          title: 'Settings Saved',
          text: 'Your settings have been saved.',
          type: 'is-info',
        });
      } catch (e) {
        this.emitError(e);
      }

      this.isLoading = false;
    },

    async sendVerificationCode() {
      this.isLoading = true;

      await this.sendCode(this.email);

      this.isLoading = false;
    },

    onFormSubmit() {
      if (!this.isButtonDisabled) {
        this.toggleTwoFactorAuthModal();
      }
    },
  },

  async mounted() {
    await this.getOtpSettings();
    await this.sendVerificationCode();
  },

  mixins: [modalMixin],

  components: {
    TwoFactorAuthModal,
  },
};
</script>
