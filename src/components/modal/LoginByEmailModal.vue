<template>
  <v-modal class="is-dark" @close="handleClose">
    <template slot="header">Get Started</template>

    <p class="subtitle">Please enter your email address below to access your
      wallet or create a new one.</p>

    <v-form
      id="loginByEmail"
      @submit="handleSubmit">
      <v-input v-model="email"
               label="Email"
               help="Your email address may be used to help recover your
               wallet in case you lose access."
               name="email"
               validator="required|email"
               placeholder="Your email"
               :disabled="isLoading" />

        <v-checkbox v-model="termsAccepted">
          I accept the <a href="https://endpass.com/terms/" target="_blank">Terms of Service</a>
          and <a href="https://endpass.com/privacy/" target="_blank">Privacy
            Policy</a>.
        </v-checkbox>
    </v-form>
    <div class="buttons" slot="footer">
      <v-button className="is-primary is-medium"
                form="loginByEmail"
                data-test="submit-login"
                :disabled="!termsAccepted"
                :loading="isLoading">Continue</v-button>
    </div>
  </v-modal>
</template>

<script>
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VButton from '@/components/ui/form/VButton';
import VCheckbox from '@/components/ui/form/VCheckbox';

export default {
  name: 'login-by-email-modal',
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    email: '',
    termsAccepted: true,
  }),
  methods: {
    handleSubmit() {
      this.$emit('confirm', this.email);
    },
    handleClose() {
      this.$emit('close');
    },
  },
  components: {
    VModal,
    VForm,
    VInput,
    VButton,
    VCheckbox,
  },
};
</script>
