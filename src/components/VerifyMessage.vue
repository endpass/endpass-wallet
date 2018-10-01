<template>
  <v-form
    data-test="verifying-message-form"
    @submit="verifyMessage"
  >
    <v-textarea
      v-model="signedMessageString"
      label="Signature"
      data-test="signed-message-textarea"
    />
    <v-button
      :disabled="!signedMessage"
      class-name="is-primary is-medium"
      data-test="verify-button"
    >
      Verify message
    </v-button>
    <div
      v-if="address"
      class="field"
      data-test="address-field"
    >
      <label class="label">Address</label>
      <p>{{ address }}</p>
    </div>
  </v-form>
</template>

<script>
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VTextarea from '@/components/ui/form/VTextarea.vue';
import web3 from '@/utils/web3';

export default {
  name: 'VerifyMessage',
  data: () => ({
    address: null,
    signedMessageString: null,
  }),
  computed: {
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
        this.address = web3.eth.accounts.recover(this.signedMessage);
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
