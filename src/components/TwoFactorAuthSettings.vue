<template>
  <div>
    <v-form @submit="handleFormSubmit">
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
      @request-code="hanleCodeRequest"
      @close="toggleTwoFactorAuthModal"
      @confirm="handleConfirmTwoFactorAuthModal"
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
      'requestCode',
    ]),
    ...mapActions('errors', ['emitError']),

    async handleConfirmTwoFactorAuthModal({ otpCode, verificationCode }) {
      const { secret } = this.otpSettings;

      this.toggleTwoFactorAuthModal();
      this.isLoading = true;

      try {
        if (secret) {
          await this.setOtpSettings({ secret, otpCode, verificationCode });
        } else {
          await this.deleteOtpSettings({ otpCode, verificationCode });
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

    async hanleCodeRequest() {
      this.isLoading = true;

      await this.requestCode(this.email);

      this.isLoading = false;
    },

    handleFormSubmit() {
      if (!this.isButtonDisabled) {
        this.toggleTwoFactorAuthModal();
      }
    },
  },

  mounted() {
    this.getOtpSettings();
    this.hanleCodeRequest();
  },

  mixins: [modalMixin],

  components: {
    TwoFactorAuthModal,
  },
};
</script>
