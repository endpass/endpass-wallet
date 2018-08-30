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
      @submit="handleSubmit">
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
        :disabled="!termsAccepted"
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

const availableIdentityServerTypes = [
  'Endpass',
  'Local Storage',
  'Custom server',
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
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'submit_email',
      });

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
