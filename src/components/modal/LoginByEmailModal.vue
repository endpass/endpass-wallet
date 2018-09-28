<template>
  <v-modal
    class="is-dark"
    @close="handleClose"
  >
    <template slot="header">Get Started</template>

    <p class="subtitle">Please enter your email address below to access your
    wallet or create a new one.</p>

    <v-form
      id="loginByEmail"
      v-model="isFormValid"
      @submit="handleSubmit"
    >
      <v-input
        v-model="email"
        :disabled="isLoading"
        label="Email"
        help="Your email address may be used to help recover your
               wallet in case you lose access."
        name="email"
        validator="required|email"
        placeholder="Your email"
      />

      <v-select
        :disabled="isLoading"
        :options="availableIdentityServerTypes"
        v-model="currentIdentityServerType"
        label="Identity Server"
        name="currentIdentityServerType"
      />

      <v-input
        v-if="selectedCustomIdentityServerType"
        id="customIdentityServer"
        v-model="customIdentityServer"
        :disabled="isLoading"
        label="Custom Identity Server"
        name="customIdentityServer"
        validator="required|url:require_protocol:true"
        placeholder="Custom Identity Server"
      />

      <v-checkbox v-model="termsAccepted">
        I accept the <a
          href="https://endpass.com/terms/"
          target="_blank"
        >
          Terms of Service
        </a>
        and
        <a
          href="https://endpass.com/privacy/"
          target="_blank"
        >
          Privacy Policy
        </a>.
      </v-checkbox>
    </v-form>
    <div
      slot="footer"
      class="buttons"
    >
      <v-button
        :disabled="!termsAccepted || !isFormValid"
        :loading="isLoading"
        class-name="is-primary is-medium"
        form="loginByEmail"
        data-test="submit-login"
      >
        Continue
      </v-button>
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
import { IDENTITY_MODE } from '@/constants';

const availableIdentityServerTypes = [
  { text: 'Endpass', val: IDENTITY_MODE.DEFAULT },
  { text: 'Local Storage', val: IDENTITY_MODE.LOCAL },
  { text: 'Custom server', val: IDENTITY_MODE.CUSTOM },
];

export default {
  name: 'LoginByEmailModal',
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
    currentIdentityServerType: availableIdentityServerTypes[0].val,
    customIdentityServer: null,
    isFormValid: false,
  }),
  computed: {
    selectedCustomIdentityServerType() {
      return this.currentIdentityServerType === IDENTITY_MODE.CUSTOM;
    },
  },
  methods: {
    handleSubmit() {
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'submit_email',
      });

      const { email } = this;
      const mode = {
        type: this.currentIdentityServerType,
        serverUrl: this.selectedCustomIdentityServerType
          ? this.customIdentityServer
          : undefined,
      };

      this.$emit('confirm', { email, mode });
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
