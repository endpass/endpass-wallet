<template>
  <div>
    <v-form id="signing-message-form">
      <v-textarea
        v-model="message"
        label="Message"
        placeholder="This is a message that you are signing to prove that you own the address you say you own."
      />
      <v-button
        className="is-primary is-medium"
        :disabled="!message"
        @click.prevent="togglePasswordModal">Sign message</v-button>
      <v-textarea
        v-if="signedMessage"
        v-model="getSignedMessage"
        label="Signature"
        disabled
      />
    </v-form>
    <password-modal
      v-if="isPasswordModal"
      @confirm="signMessage"
      @close="togglePasswordModal"
    >
      <div class="field">
        <label class="label">Message</label>
        <p>{{message}}</p>
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
import modalMixin from '@/mixins/modal';

export default {
  name: 'sign-message',
  data: () => ({
    message: '',
    signedMessage: null
  }),
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
      web3: state => state.web3.web3,
    }),
    getSignedMessage() {
      return JSON.stringify(this.signedMessage);
    }
  },
  methods: {
    signMessage(password) {
      try {
        this.togglePasswordModal();
        this.signedMessage = this.web3.eth.accounts.sign(this.message, this.wallet.getPrivateKey(password));
      } catch (error) {
        this.signedMessage = null;
        this.$notify({
          title: 'Error signing message',
          text: 'An error occurred while signing the message. Please try again.',
          type: 'is-danger',
        });
        console.error(error);
      }
    }
  },
  mixins: [modalMixin],
  components: {
    VForm,
    VButton,
    VTextarea,
    PasswordModal
  }
};
</script>
