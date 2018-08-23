<template lang="html">
  <div class="password-modal">
    <v-modal @close="close">
      <template slot="header">Password confirmation required</template>

      <div>
        <p class="subtitle">Please enter your wallet password to
          continue.</p>
        <v-form id="password-form" @submit="confirm">
          <slot />
          <v-password
            v-model="jsonKeystorePassword"
            name="jsonKeystorePassword"
            validator="required"
            data-vv-as="password"
            placeholder="Your Wallet Password"
            required
            @input="handleInput"
          />
        </v-form>
      </div>
      <div class="buttons" slot="footer">
        <v-button
          form="password-form"
          :loading="processingConfirmation"
          class-name="is-primary is-medium"
          >Confirm</v-button>
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

export default {
  name: 'PasswordModal',
  data() {
    return {
      jsonKeystorePassword: '',
      processingConfirmation: false,
    };
  },
  methods: {
    ...mapActions('accounts', ['validatePassword']),
    confirm() {
      this.processingConfirmation = true;
      const { jsonKeystorePassword: password } = this;

      this.validatePassword(password)
        .then(() => {
          this.processingConfirmation = false;
          this.$emit('confirm', password);
        })
        .catch(() => {
          this.processingConfirmation = false;
          this.errors.add({
            field: 'jsonKeystorePassword',
            msg: 'Password is invalid',
            id: 'wrongPassword',
          });
        });
    },
    close() {
      this.$emit('close');
    },
    handleInput() {
      this.errors.removeById('wrongPassword');
    },
  },
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
