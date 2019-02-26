<template>
  <div>
    <v-form
      id="signing-transaction-form"
      @submit="togglePasswordModal"
    >
      <v-textarea
        v-model="transaction"
        label="Transaction object (JSON)"
        placeholder="This is a transaction that you are signing to prove that you own it."
      />
      <v-button
        :disabled="!transaction"
        class-name="is-primary is-medium"
      >Sign transaction</v-button>
      <div
        v-if="signedTransaction"
        class="field"
      >
        <label class="label">RLP encoded transaction</label>
        <p class="code">{{ signedTransaction }}</p>
      </div>
    </v-form>
    <code-password-modal
      v-if="isPasswordModal"
      :code="transaction"
      label="Transaction object"
      @confirm="signTransaction"
      @close="togglePasswordModal"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CodePasswordModal from '@/components/modal/CodePasswordModal';
import modalMixin from '@/mixins/modal';

export default {
  name: 'SignTransaction',

  data: () => ({
    transaction: '',
    signedTransaction: null,
  }),

  computed: {
    ...mapGetters('accounts', ['wallet']),
  },

  methods: {
    async signTransaction(password) {
      try {
        this.togglePasswordModal();

        this.signedTransaction = await this.wallet.signTransaction(
          JSON.parse(this.transaction),
          password,
        );
      } catch (error) {
        this.signedTransaction = null;
        this.$notify({
          title: 'Error signing transaction',
          text:
            'An error occurred while signing the transaction. Please try again.',
          type: 'is-danger',
        });
        console.error(error);
      }
    },
  },

  mixins: [modalMixin],

  components: {
    CodePasswordModal,
  },
};
</script>
