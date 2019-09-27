<template lang="html">
  <v-modal
    class="is-dark"
    @close="close"
  >
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
        {{ $t('components.twoFactorAuthModal.paragaph3') }}
      </p>
    </div>
    <v-form
      id="twoFactorAuth"
      :is-form-valid="isFormValid"
      @submit="confirm"
    >
      <div
        v-if="secret && email"
        class="field"
      >
        <div class="has-text-centered">
          <img :src="qrCodeSrc">
        </div>
        <p class="subtitle">
          {{ $t('components.twoFactorAuthModal.writeDownCode') }}
        </p>
        <label class="label">
          {{ $t('components.twoFactorAuthModal.secret') }}</label>
        <p class="subtitle twofa-secret">
          <strong>{{ secret }}</strong>
        </p>
      </div>
      <p class="subtitle">
        {{ $t('components.twoFactorAuthModal.enterCode') }}
      </p>
      <v-input
        v-model="code"
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
  data() {
    return {
      code: null,
    };
  },
  computed: {
    qrCodeSrc() {
      const otpAuthUri = `otpauth://totp/Endpass:${this.email}?issuer=Endpass&secret=${this.secret}`;

      return `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(
        otpAuthUri,
      )}`;
    },
  },
  methods: {
    confirm() {
      this.$emit('confirm', this.code);
    },
    close() {
      this.$emit('close');
    },
  },
  mixins: [formMixin],
};
</script>
