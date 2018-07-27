<template>
  <v-form :sumbmitHandler="verifyMessage">
    <v-textarea
      v-model="signedMessageString"
      label="Signature"
    />
    <v-button
      className="is-primary is-medium"
      :disabled="!signedMessage">Verify message</v-button>
    <div class="field" v-if="address">
      <label class="label">Address</label>
      <p>{{address}}</p>
    </div>
  </v-form>
</template>

<script>
import { mapState } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VTextarea from '@/components/ui/form/VTextarea.vue';

export default {
  name: 'verify-message',
  data: () => ({
    address: null,
    signedMessageString: null,
  }),
  computed: {
    ...mapState({
      web3: state => state.web3.web3,
    }),
    signedMessage() {
      try {
        return JSON.parse(this.signedMessageString);
      } catch (error) {
        return '';
      }
    },
  },
  methods: {
    verifyMessage() {
      try {
        this.address = this.web3.eth.accounts.recover(this.signedMessage);
      } catch (error) {
        this.address = null;
        this.$notify({
          title: 'Error while verifying the message',
          text:
            'An error occurred while verifying the message. Please try again.',
          type: 'is-danger',
        });
        console.error(error);
      }
    },
  },
  components: {
    VForm,
    VButton,
    VTextarea,
  },
};
</script>
