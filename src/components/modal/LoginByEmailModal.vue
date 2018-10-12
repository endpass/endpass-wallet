<template>
  <v-modal
    class="is-dark"
    @close="handleClose"
  >
    <template slot="header">Get Started</template>

    <p
      v-if="isSelectDefaultIdentity"
      class="subtitle"
    >
      Please enter your email address below to access your wallet or create a new one.
    </p>
    <p
      v-else-if="isSelectCustomIdentity"
      class="subtitle"
    >
      Please enter your server address below to access your accounts.
    </p>

    <v-form
      id="loginByEmail"
      v-model="isFormValid"
      @submit="handleSubmit"
    >
      <v-input
        v-if="isSelectDefaultIdentity"
        key="email-input"
        v-model="email"
        :disabled="!isInputAllowed"
        label="Email"
        help="Your email address may be used to help recover your
               wallet in case you lose access."
        name="email"
        validator="required|email"
        placeholder="Your email"
      />

      <v-select
        :disabled="!isInputAllowed"
        :options="availableIdentityServerTypes"
        v-model="currentIdentityServerType"
        label="Identity Server"
        name="currentIdentityServerType"
      />

      <v-input
        v-if="isSelectCustomIdentity"
        id="customIdentityServer"
        key="custom-identity-server"
        v-model="customIdentityServer"
        :disabled="!isInputAllowed"
        label="Custom Identity Server"
        name="customIdentityServer"
        validator="required|url:require_protocol:true"
        placeholder="Custom Identity Server"
        help="Example: https://yourserver.com/api"
      />

      <v-checkbox
        v-if="isSelectDefaultIdentity"
        v-model="termsAccepted"
      >
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
        :loading="!isInputAllowed"
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
import { mapActions } from 'vuex';
import error from '@/mixins/error';

const availableIdentityServerTypes = [
  { text: 'Endpass', val: IDENTITY_MODE.DEFAULT },
  { text: 'Local Storage', val: IDENTITY_MODE.LOCAL },
  { text: 'Custom server', val: IDENTITY_MODE.CUSTOM },
].filter(mode => !(isProduction && mode.val === IDENTITY_MODE.LOCAL));

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
    isValidating: false,
  }),
  computed: {
    isInputAllowed() {
      return !this.isLoading && !this.isValidating;
    },
    isSelectDefaultIdentity() {
      return this.currentIdentityServerType === IDENTITY_MODE.DEFAULT;
    },
    isSelectCustomIdentity() {
      return this.currentIdentityServerType === IDENTITY_MODE.CUSTOM;
    },
  },
  methods: {
    ...mapActions('user', ['validateCustomServer']),
    async validateServer(serverUrl) {
      this.isValidating = true;

      try {
        await this.validateCustomServer({ serverUrl });
      } finally {
        this.isValidating = false;
      }
    },
    async handleSubmit() {
      try {
        this.$ga.event({
          eventCategory: 'onboarding',
          eventAction: 'submit_email',
        });

        let serverUrl;

        if (this.isSelectCustomIdentity) {
          serverUrl = this.customIdentityServer.replace(/\/+$/, '');
          await this.validateServer(serverUrl);
        }

        const { email } = this;
        const mode = {
          type: this.currentIdentityServerType,
          serverUrl,
        };

        this.$emit('confirm', { email, mode });
      } catch (e) {
        this.emitError(e);
      }
    },
    handleClose() {
      this.$emit('close');
    },
  },
  mixins: [error],
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
