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
      @close="toggleTwoFactorAuthModal"
      @confirm="handleConfirmTwoFactorAuthModal"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm';
import VButton from '@/components/ui/form/VButton';
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
  },
  methods: {
    ...mapActions('user', [
      'getOtpSettings',
      'setOtpSettings',
      'deleteOtpSettings',
    ]),
    async handleConfirmTwoFactorAuthModal(code) {
      const { secret } = this.otpSettings;

      this.toggleTwoFactorAuthModal();
      this.isLoading = true;

      if (secret) {
        await this.setOtpSettings({ secret, code });
      } else {
        await this.deleteOtpSettings({ code });
      }

      this.isLoading = false;
    },
    handleFormSubmit() {
      !this.isButtonDisabled && this.toggleTwoFactorAuthModal();
    },
  },
  mounted() {
    this.getOtpSettings();
  },
  mixins: [modalMixin],
  components: {
    VForm,
    VButton,
    TwoFactorAuthModal,
  },
};
</script>
