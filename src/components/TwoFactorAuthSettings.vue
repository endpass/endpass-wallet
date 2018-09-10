<template>
  <div>
    <v-form @submit="handleFormSubmit">
      <label class="label">Two Factor Authentication</label>
      <v-button className="is-primary is-medium"
                :disabled="isButtonDisabled"
                :loading="isLoading">
        {{otpSettings.secret ? 'Enable' : 'Disable'}} Two Factor Auth
      </v-button>
    </v-form>
    <two-factor-auth-modal v-if="isTwoFactorAuthModal"
                           @close="toggleTwoFactorAuthModal"
                           @confirm="handleConfirmTwoFactorAuthModal"
                           v-bind:secret="otpSettings.secret"
                           v-bind:email="email"/>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm';
import VButton from '@/components/ui/form/VButton';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import modalMixin from '@/mixins/modal';

export default {
  name: 'two-factor-auth-settings',
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
  components: {
    VForm,
    VButton,
    TwoFactorAuthModal,
  },
  mounted() {
    this.getOtpSettings();
  },
  mixins: [modalMixin],
};
</script>
