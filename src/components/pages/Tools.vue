<template>
  <div class="app-page tools-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Tools</h1>
          </div>
          <div class="card-content">
            <v-form id="signing-message-form">
              <v-textarea
                v-model="signingMessage.message"
                label="Message"
                placeholder="This is a message that you are signing to prove that you own the address you say you own."
              />
              <v-button
                className="is-primary is-medium"
                :disabled="!signingMessage.message"
                @click.prevent="togglePasswordModal">Sign message</v-button>
              <v-textarea
                v-if="signingMessage.signedMessage"
                v-model="getSignedMessage"
                label="Signature"
              />
            </v-form>
          </div>
        </div>
      </div>
    </div>
    <password-modal
      v-if="isPasswordModal"
      @confirm="signMessage"
      @close="togglePasswordModal"
    >
      <div class="field">
        <label class="label">Message</label>
        <p>{{signingMessage.message}}</p>
      </div>
    </password-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VTextarea from '@/components/ui/form/VTextarea.vue';
import PasswordModal from '@/components/modal/PasswordModal';

export default {
  name: 'tools-page',
  data: () => ({
    signingMessage: {
      message: '',
      signedMessage: null
    },
    isPasswordModal: false
  }),
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
      web3: state => state.web3.web3,
    }),
    getSignedMessage() {
      return JSON.stringify(this.signingMessage.signedMessage);
    }
  },
  methods: {
    togglePasswordModal() {
      this.isPasswordModal = !this.isPasswordModal;
    },
    signMessage(password) {
      try {
        this.togglePasswordModal();
        this.signingMessage.signedMessage = this.web3.eth.accounts.sign(this.signingMessage.message, this.wallet.getPrivateKey(password));
      } catch (error) {
        this.signingMessage.signedMessage = null;
        this.$notify({
          title: 'Error signing message',
          text: 'An error occurred while signing the message. Please try again.',
          type: 'is-danger',
        });
        console.error(error);
      }
    }
  },
  components: {
    VForm,
    VButton,
    VTextarea,
    PasswordModal
  }
};
</script>
