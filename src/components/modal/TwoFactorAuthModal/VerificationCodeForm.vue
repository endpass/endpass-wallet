<template>
  <v-form
    id="verificationCode"
    :is-form-valid="isFormValid"
    @submit="onFormSubmit"
  >
    <div class="verification-code-form-section">
      <label class="subtitle">
        {{ $t('components.twoFactorAuthModal.enterVerificationCode') }}
      </label>
      <v-input
        v-model="verificationCode"
        v-validate="'required|digits:6'"
        :error="errors.first('verificationCode')"
        type="number"
        size="6"
        :label="$t('components.twoFactorAuthModal.verificationCode')"
        name="verificationCode"
        data-vv-name="verificationCode"
        data-test="input-two-auth-verification-code"
        autofocus
      />
    </div>
    <div class="verification-code-form-section v-text-center">
      <span>{{ $t('components.twoFactorAuthModal.didNotGetCode') }}</span>
      <a class="link" @click="onCodeRequest">
        {{ $t('components.twoFactorAuthModal.resendCode') }}
      </a>
    </div>
    <v-button
      :loading="isLoading"
      :disabled="!isFormValid"
      class-name="is-primary is-medium"
      data-test="submit-two-auth-modal"
    >
      {{ $t('global.continue') }}
    </v-button>
  </v-form>
</template>

<script>
import formMixin from '@/mixins/form';

export default {
  name: 'VerificationCodeForm',

  props: {
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

  methods: {
    onFormSubmit() {
      if (!this.isFormValid) return;

      this.$emit('submit', this.verificationCode);
    },

    onCodeRequest() {
      this.$emit('request-code');
    },
  },

  mixins: [formMixin],
};
</script>

<style lang="scss">
.verification-code-form-section {
  margin-bottom: 30px;
}
</style>
