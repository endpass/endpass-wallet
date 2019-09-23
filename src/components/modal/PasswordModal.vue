<template lang="html">
  <div
    class="password-modal"
    data-test="password-modal"
  >
    <v-modal @close="close">
      <template slot="header">
        {{ title }}
      </template>

      <div>
        <p class="subtitle">
          {{ $t('components.passwordModal.enterWalletPassword') }}
        </p>
        <v-form
          id="password-form"
          :is-form-valid="isFormValid"
        >
          <slot />
          <v-password
            v-model="jsonKeystorePassword"
            v-validate="'required|min:8'"
            :error="errors.first('jsonKeystorePassword')"
            name="jsonKeystorePassword"
            validator="required"
            data-vv-as="password"
            data-vv-name="jsonKeystorePassword"
            :placeholder="$t('components.passwordModal.walletPassword')"
            required
            data-test="input-password"
            autofocus
            @input="handleInput"
          />
        </v-form>
      </div>
      <div
        slot="footer"
        class="buttons"
      >
        <v-button
          :loading="processingConfirmation"
          :disabled="!isFormValid"
          form="password-form"
          data-test="submit-password"
          class-name="is-primary is-medium"
          @click="confirm"
        >
          {{ $t('global.confirm') }}
        </v-button>
      </div>
    </v-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import formMixin from '@/mixins/form';
import i18n from '@/locales/i18n';

export default {
  name: 'PasswordModal',

  props: {
    title: {
      type: String,
      default: i18n.t('components.passwordModal.enterWalletPassword'),
    },
  },

  data() {
    return {
      jsonKeystorePassword: '',
      processingConfirmation: false,
    };
  },
  methods: {
    ...mapActions('accounts', ['validatePassword']),

    async confirm() {
      const { jsonKeystorePassword: password } = this;

      try {
        this.processingConfirmation = true;

        await this.validatePassword(password);

        this.$emit('confirm', password);
      } catch (err) {
        this.errors.add({
          field: 'jsonKeystorePassword',
          msg: this.$t('components.passwordModal.passwordInvalid'),
          id: 'wrongPassword',
        });
      } finally {
        this.processingConfirmation = false;
      }
    },

    close() {
      this.$emit('close');
    },

    handleInput() {
      this.errors.removeById('wrongPassword');
    },
  },
  mixins: [formMixin],
};
</script>

<style lang="scss">
.passsword-modal {
}
</style>
