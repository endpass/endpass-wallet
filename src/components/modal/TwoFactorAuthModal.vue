<template>
  <v-modal
    class="is-dark two-factor-auth-modal"
    @close="close"
  >
    <template slot="header">
      {{ $t('components.twoFactorAuthModal.header') }}
    </template>
    <div v-if="secret">
      <p class="lead">
        {{ $t('components.twoFactorAuthModal.paragraph1') }}
      </p>
      <p class="lead">
        {{ $t('components.twoFactorAuthModal.paragraph2') }}
        <strong>
          {{ $t('components.twoFactorAuthModal.googleAuthenticator') }}
        </strong>
      </p>
      <p class="lead">
        {{ $t('components.twoFactorAuthModal.paragraph3') }}
      </p>
    </div>
    <v-form
      id="twoFactorAuth"
      :is-form-valid="isFormValid"
      @submit="confirm"
    >
      <div
        v-if="isShowQRCode"
        class="two-factor-auth-modal-section"
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
      <template v-if="secret">
        <div class="two-factor-auth-modal-section">
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
      </template>
      <div class="two-factor-auth-modal-section">
        <label class="subtitle">
          {{ $t('components.twoFactorAuthModal.enterCode') }}
        </label>
        <v-input
          v-model="code"
          v-validate="'required|digits:6'"
          :error="errors.first('code')"
          type="number"
          size="6"
          :label="$t('components.twoFactorAuthModal.otpCode')"
          name="code"
          data-vv-name="code"
          data-test="input-two-auth-code"
          autofocus
        />
      </div>
      <div class="two-factor-auth-modal-code-section v-text-center">
        <span>{{ $t('components.twoFactorAuthModal.didNotGetCode') }}</span>
        <a
          class="link"
          @click="handleCodeRequest"
        >
          {{ $t('components.twoFactorAuthModal.resendCode') }}
        </a>
      </div>
    </v-form>
    <div
      slot="footer"
      class="buttons"
    >
      <v-button
        :loading="isLoading"
        :disabled="!isFormValid"
        form="twoFactorAuth"
        class-name="is-primary is-medium"
        data-test="submit-two-auth-modal"
      >
        {{ $t('global.verify') }}
      </v-button>
    </div>
  </v-modal>
</template>

<script>
import formMixin from '@/mixins/form';

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
    code: '',
    verificationCode: '',
  }),

  computed: {
    isShowQRCode() {
      return this.email && this.secret;
    },

    qrCodeSrc() {
      const otpAuthUri = `otpauth://totp/Endpass:${this.email}?issuer=Endpass&secret=${this.secret}`;

      return `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(
        otpAuthUri,
      )}`;
    },
  },

  methods: {
    handleCodeRequest() {
      this.$emit('request-code');
    },

    confirm() {
      const { code, verificationCode } = this;

      this.$emit('confirm', {
        code,
        verificationCode,
      });
    },

    close() {
      this.$emit('close');
    },
  },

  mixins: [formMixin],
};
</script>

<style lang="scss">
.two-factor-auth-modal-section {
  margin-bottom: 30px;
}
</style>
