<template>
  <v-modal class="is-dark two-factor-auth-modal" @close="close">
    <template slot="header">
      {{ $t('components.twoFactorAuthModal.header') }}
    </template>
    <two-factor-auth-form
      :secret="secret"
      :email="email"
      :is-loading="isLoading"
      @submit="onFormSubmit"
    />
  </v-modal>
</template>

<script>
import TwoFactorAuthForm from './TwoFactorAuthForm';

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

  methods: {
    onFormSubmit({ code, verificationCode }) {
      this.$emit('confirm', {
        verificationCode,
        code,
      });
    },

    close() {
      this.$emit('close');
    },
  },

  components: {
    TwoFactorAuthForm,
  },
};
</script>

<style lang="scss">
.two-factor-auth-modal-section {
  margin-bottom: 30px;
}
</style>
