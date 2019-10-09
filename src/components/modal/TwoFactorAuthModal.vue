<template>
  <v-modal class="is-dark two-factor-auth-modal" @close="close">
    <template slot="header">
      {{ $t('components.twoFactorAuthModal.header') }}
    </template>
    <div v-if="secret">
      <p class="lead">
        {{ $t('components.twoFactorAuthModal.paragaph1') }}
      </p>
      <p class="lead">
        {{ $t('components.twoFactorAuthModal.paragaph2') }}
        <strong>
          {{ $t('components.twoFactorAuthModal.googleAuthentificator') }}
        </strong>
      </p>
      <p class="lead">
        {{ $t('components.twoFactorAuthModal.paragaph3') }}
      </p>
    </div>
    <v-form id="twoFactorAuth" :is-form-valid="isFormValid" @submit="confirm">
      <div v-if="secret && email" class="field">
        <div class="has-text-centered">
          <img :src="qrCodeSrc" />
        </div>
        <p class="subtitle">
          {{ $t('components.twoFactorAuthModal.writeDownCode') }}
        </p>
        <label class="label">
          {{ $t('components.twoFactorAuthModal.secret') }}</label
        >
        <p class="subtitle twofa-secret">
          <strong>{{ secret }}</strong>
        </p>
      </div>
      <p class="subtitle">
        {{ $t('components.twoFactorAuthModal.enterCode') }}
      </p>
      <v-input
        v-model="otpCode"
        v-validate="'required|digits:6'"
        :error="errors.first('otpCode')"
        type="number"
        size="6"
        :label="$t('components.twoFactorAuthModal.otpCode')"
        name="otpCode"
        data-vv-name="otpCode"
        data-test="input-two-auth-code"
        autofocus
      />
      <p class="subtitle">
        {{ $t('components.twoFactorAuthModal.enterVerificationCode') }}
      </p>
      <v-input
        v-model="verificationCode"
        v-validate="'required|digits:6'"
        :error="errors.first('verificationCode')"
        type="number"
        size="6"
        :label="$t('components.twoFactorAuthModal.verificationCode')"
        name="verificationCode"
        data-vv-name="verificationCode"
        data-test="input-two-auth-code"
        autofocus
      />
      <div class="two-factor-auth-modal-code-link v-text-center">
        <v-link @click="handleCodeRequest">Request another code</v-link>
      </div>
    </v-form>
    <div slot="footer" class="buttons">
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
import VLink from '@endpass/ui/kit/VLink';
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
    otpCode: '',
    verificationCode: '',
  }),

  computed: {
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
      const { otpCode, verificationCode } = this;

      this.$emit('confirm', {
        otpCode,
        verificationCode,
      });
    },

    close() {
      this.$emit('close');
    },
  },

  mixins: [formMixin],

  components: {
    VLink,
  },
};
</script>

<style lang="scss">
.two-factor-auth-modal-code-link {
  margin-bottom: 20px;
}
</style>
