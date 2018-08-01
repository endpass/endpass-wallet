<template>
  <v-form @submit="handleFormSubmit">
    <label class="label">Two Factor Authentication via OTP</label>
    <v-button className="is-primary is-medium"
              :disabled="isButtonDisabled"
              :loading="isLoading">
      {{otpSettings.secret ? 'Enable' : 'Disable'}} Two Factor Auth
    </v-button>
    <two-factor-auth-modal v-if="isTwoFactorAuthModal"
                           @close="toggleTwoFactorAuthModal"
                           @confirm="handleConfirmTwoFactorAuthModal"
                           v-bind:secret="otpSettings.secret"
                           v-bind:email="email"/>
  </v-form>
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
    ...mapState('accounts', ['email', 'otpSettings']),
    isButtonDisabled() {
      return !this.otpSettings.secret && !this.otpSettings.status;
    }
  },
  methods: {
    ...mapActions('accounts', ['getOtpSettings', 'setOtpSettings', 'deleteOtpSettings']),
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
    }
  },
  components: {
    VForm,
    VButton,
    TwoFactorAuthModal
  },
  mounted() {
    // make sure we have an email address (a proxy to see if we're logged in),
    // before attempting to get Otp settings
    // TODO: we should have a better mechanism for checking if we're logged in,
    // or least a simple abstraction func, which would make the code more
    // easily manageable, ie, when we want to change the logged in trigger from
    // checking an email address to another attribute, we would only need to do
    // it in one place
    if (this.email) {
      this.getOtpSettings();
    }
  },
  mixins: [modalMixin],
};
</script>
