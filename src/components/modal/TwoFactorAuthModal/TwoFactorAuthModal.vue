<template>
  <v-modal class="is-dark two-factor-auth-modal" @close="close">
    <template slot="header">
      {{ $t('components.twoFactorAuthModal.header') }}
    </template>
    <verification-code-form
      v-if="isVerificationCodeRequired"
      :email="email"
      :is-loading="isLoading"
      @request-code="onVerificationCodeRequest"
      @submit="onVerificationCodeSubmit"
    />
    <two-factor-auth-form
      v-else
      :secret="secret"
      :email="email"
      :is-loading="isLoading"
      @submit="onTwoFactorAuthSubmit"
    />
  </v-modal>
</template>

<script>
import TwoFactorAuthForm from './TwoFactorAuthForm';
import VerificationCodeForm from './VerificationCodeForm';

export default {
  name: 'TwoFactorAuthModal',

  props: {
    secret: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    verificationCode: '',
  }),

  computed: {
    isVerificationCodeRequired() {
      return this.secret && !this.verificationCode;
    },
  },

  methods: {
    onVerificationCodeRequest() {
      this.$emit('request-code');
    },

    onVerificationCodeSubmit(verificationCode) {
      this.verificationCode = verificationCode;
    },

    onTwoFactorAuthSubmit(code) {
      const { verificationCode } = this;

      this.$emit('confirm', {
        code,
        verificationCode,
      });
    },

    close() {
      this.$emit('close');
    },
  },

  components: {
    TwoFactorAuthForm,
    VerificationCodeForm,
  },
};
</script>

<style lang="scss">
.two-factor-auth-modal-section {
  margin-bottom: 30px;
}
</style>
