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
      >
        Sign transaction
      </v-button>
      <v-textarea
        v-if="signedTransaction"
        v-model="signedTransactionString"
        label="RLP encoded transaction"
        disabled
      />
    </v-form>
    <password-modal
      v-if="isPasswordModal"
      @confirm="signTransaction"
      @close="togglePasswordModal"
    >
      <div class="field">
        <label class="label">Transaction object</label>
        <p>{{ transaction }}</p>
      </div>
    </password-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Tx from 'ethereumjs-tx';
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VTextarea from '@/components/ui/form/VTextarea.vue';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';
import { convertTransactionToHash } from '@/utils/transactions';

export default {
  name: 'sign-transaction',

  data: () => ({
    transaction: '',
    signedTransaction: null,
  }),

  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
    }),

    signedTransactionString() {
      return convertTransactionToHash(this.signedTransaction);
    },
  },

  methods: {
    async signTransaction(password) {
      try {
        this.togglePasswordModal();

        const tx = new Tx(JSON.parse(this.transaction));

        this.signedTransaction = await this.$store.dispatch(
          'transactions/signTransaction',
          {
            transaction: tx,
            password,
          },
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
    VForm,
    VButton,
    VTextarea,
    PasswordModal,
  },
};
</script>
