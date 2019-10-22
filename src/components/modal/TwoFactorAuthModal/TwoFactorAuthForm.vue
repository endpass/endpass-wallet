<template>
  <v-form
    id="twoFactorAuthForm"
    :is-form-valid="isFormValid"
    @submit.native.prevent="onFormSubmit"
  >
    <div
      v-if="isShowQRCode"
      class="two-factor-auth-form-section"
      data-test="two-factor-modal-qr-code"
    >
      <div class="has-text-centered">
        <img :src="qrCodeSrc">
      </div>
      <label class="subtitle">
        {{ $t('components.twoFactorAuthModal.writeDownCode') }}
      </label>
      <label class="label">
        {{ $t('components.twoFactorAuthModal.secret') }}
      </label>
      <p class="subtitle twofa-secret">
        <strong>{{ secret }}</strong>
      </p>
    </div>
    <div v-if="secret" class="two-factor-auth-form-section">
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
    <div class="two-factor-auth-form-section">
      <label class="subtitle">
        {{ $t('components.twoFactorAuthModal.enterCode') }}
      </label>
      <v-input
        v-model="code"
        v-validate="'required|digits:6'"
        :error="errors.first('code')"
        :disabled="!isVerificationCodeValid"
        type="number"
        size="6"
        :label="$t('components.twoFactorAuthModal.otpCode')"
        name="code"
        data-vv-name="code"
        data-test="input-two-auth-code"
        autofocus
      />
    </div>
    <div v-if="secret" class="verification-code-form-section">
      <code-requester />
    </div>

    <v-button
      :loading="isLoading"
      :disabled="!isFormValid"
      type="submit"
      class-name="is-primary is-medium"
      data-test="submit-two-auth-modal"
    >
      {{ $t('global.verify') }}
    </v-button>
  </v-form>
</template>

<script>
import formMixin from '@/mixins/form';
import CodeRequester from '@/components/CodeRequester'

export default {
  name: 'TwoFactorAuthForm',

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
    code: '',
    verificationCode: ''
  }),

  computed: {
    isShowQRCode() {
      return this.email && this.secret;
    },

    isVerificationCodeValid() {
      if (!this.secret) {
        return true
      }

      return this.verificationCode && !this.errors.has('verificationCode')
    },

    qrCodeSrc() {
      const otpAuthUri = `otpauth://totp/Endpass:${this.email}?issuer=Endpass&secret=${this.secret}`;

      return `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(
        otpAuthUri,
      )}`;
    },
  },

  methods: {
    onFormSubmit() {
      const { code, verificationCode, isFormValid } = this

      if (!isFormValid) return;

      this.$emit('submit', {
        code,
        verificationCode,
      });
    },
  },

  mixins: [formMixin],

  components: {
    CodeRequester
  }
};
</script>

<style lang="scss">
.two-factor-auth-form-section {
  margin-bottom: 30px;
}
</style>
