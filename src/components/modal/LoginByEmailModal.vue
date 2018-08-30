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

      <v-select v-model="currentIdentityServerType"
                label="Identity Server"
                name="currentIdentityServerType"
                :options="availableIdentityServerTypes"
                :disabled="isLoading" />

      <v-input v-model="customIdentityServer"
               v-if="selectedCustomIdentityServerType"
               label="Custom Identity Server"
               id="customIdentityServer"
               name="customIdentityServer"
               validator="required|url:require_protocol:true"
               placeholder="Custom Identity Server"
               :disabled="isLoading" />

      <v-checkbox v-model="termsAccepted">
        I accept the <a href="https://endpass.com/terms/" target="_blank">Terms of Service</a>
        and <a href="https://endpass.com/privacy/" target="_blank">Privacy Policy</a>.
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
import VSelect from '@/components/ui/form/VSelect';

const availableIdentityServerTypes = [
  'Endpass',
  'Local Storage',
  'Custom server',
];

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
    availableIdentityServerTypes,
    currentIdentityServerType: availableIdentityServerTypes[0],
    customIdentityServer: null,
  }),
  computed: {
    selectedCustomIdentityServerType() {
      return this.currentIdentityServerType === 'Custom server';
    },
  },
  methods: {
    handleSubmit() {
      const serverSettings = {
        type: this.currentIdentityServerType,
        url: this.selectedCustomIdentityServerType
          ? this.customIdentityServer
          : undefined,
      };

      this.$emit('confirm', this.email, serverSettings);
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
    VSelect,
  },
};
</script>
