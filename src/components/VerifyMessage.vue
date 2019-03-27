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
    >Verify message</v-button>
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
import { mapGetters } from 'vuex';

export default {
  name: 'VerifyMessage',

  data: () => ({
    address: null,
    signedMessageString: null,
  }),

  computed: {
    ...mapGetters('accounts', ['wallet']),

    signedMessage() {
      try {
        return JSON.parse(this.signedMessageString);
      } catch (error) {
        return '';
      }
    },
  },

  methods: {
    async verifyMessage() {
      try {
        const { message, signature } = this.signedMessage;
        this.address = await this.wallet.recover(message, signature);
      } catch (error) {
        this.address = null;

        this.$notify({
          title: 'Error while verifying the message',
          text:
            'An error occurred while verifying the message. Please try again.',
          type: 'is-danger',
        });
        /* eslint-disable-next-line no-console */
        console.error(error);
      }
    },
  },
};
</script>
