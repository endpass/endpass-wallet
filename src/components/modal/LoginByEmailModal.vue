<template>
  <v-modal @close="handleClose">
    <template slot="header">Login/Register</template>

    <v-form @submit="handleSubmit">
      <v-input v-model="email"
               label="Email"
               name="email"
               validator="required|email"
               placeholder="Your email"
               :disabled="isLoading" />

      <v-checkbox v-model="termsAccepted">
        I accept <a href="https://endpass.com/terms/" target="_blank">Terms of Service</a>
        and <a href="https://endpass.com/privacy/" target="_blank">Privacy Policy</a>
      </v-checkbox>

      <v-button className="is-primary is-medium"
                :disabled="!termsAccepted"
                :loading="isLoading">Send</v-button>
    </v-form>
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
  data:() => ({
    email: '',
    termsAccepted: false,
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
