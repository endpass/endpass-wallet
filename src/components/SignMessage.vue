<template>
  <div>
    <v-form
      id="signing-message-form"
      data-test="signing-message-form"
      @submit="togglePasswordModal"
    >
      <v-textarea
        v-model="message"
        label="Message"
        placeholder="This is a message that you are signing to prove that you own the address you say you own."
        data-test="message-textarea"
      />
      <v-button
        :disabled="!message"
        class-name="is-primary is-medium"
        data-test="sign-button"
      >Sign message</v-button>
      <v-textarea
        v-if="signedMessage"
        v-model="getSignedMessage"
        label="Signature"
        disabled
        data-test="signed-message-textarea"
      />
    </v-form>
    <password-modal
      v-if="isPasswordModal"
      @confirm="signMessage"
      @close="togglePasswordModal"
    >
      <div class="field">
        <label class="label">Message</label>
        <p>{{ message }}</p>
      </div>
    </password-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';

export default {
  name: 'SignMessage',

  data: () => ({
    message: '',
    signedMessage: null,
  }),

  computed: {
    ...mapGetters('accounts', ['wallet']),

    getSignedMessage() {
      return JSON.stringify(this.signedMessage);
    },
  },

  methods: {
    async signMessage(password) {
      try {
        this.togglePasswordModal();
        this.signedMessage = await this.wallet.sign(this.message, password);
      } catch (error) {
        this.signedMessage = null;
        this.$notify({
          title: 'Error signing message',
          text:
            'An error occurred while signing the message. Please try again.',
          type: 'is-danger',
        });
        console.error(error);
      }
    },
  },

  mixins: [modalMixin],

  components: {
    PasswordModal,
  },
};
</script>
