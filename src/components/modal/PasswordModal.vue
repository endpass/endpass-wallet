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
        <p class="subtitle">Please enter your wallet password to continue.</p>
        <v-form
          id="password-form"
          :isFormValid="isFormValid"
        >
          <slot />
          <v-password
            v-model="jsonKeystorePassword"
            name="jsonKeystorePassword"
            validator="required"
            data-vv-as="password"
            v-validate="'required|min:8'"
            :error="errors.first('jsonKeystorePassword')"
            placeholder="Your Wallet Password"
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
          form="password-form"
          data-test="submit-password"
          class-name="is-primary is-medium"
          :disabled="!isFormValid"
          @click="confirm"
        >
          Confirm
        </v-button>
      </div>
    </v-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm.vue';
import VPassword from '@/components/ui/form/VPassword.vue';
import VButton from '@/components/ui/form/VButton.vue';
import formMixin from '@/mixins/form';

export default {
  name: 'PasswordModal',

  props: {
    title: {
      type: String,
      default: 'Please enter your wallet password to continue',
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
          msg: 'Password is invalid',
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
  components: {
    VModal,
    VForm,
    VPassword,
    VButton,
  },
};
</script>

<style lang="scss">
.passsword-modal {
}
</style>
