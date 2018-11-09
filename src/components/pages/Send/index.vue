<template>
  <div class="app-page send-page">
    <div class="section is-narrow">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Send ETH</h1>
          </div>
          <div class="card-content">
            <transaction-form
              :transaction="transaction"
              @submit="handleTransactionSend"
            />

            <div
              v-if="transactionHash"
              class="transaction-status message is-success"
              data-test="transaction-status"
            >
              <div class="message-header">
                <p>Transaction Sent!</p>
              </div>
              <div class="message-body">
                <p>Your transaction has been broadcast to the network. It may take a few minutes before the transaction is confirmed.</p>
                <p class="label">Transaction Id</p>
                <p class="code">{{ transactionHash }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <transaction-modal
      v-if="isWaitingConfirm"
      :transaction="transaction"
      @confirm="confirmTransaction"
      @close="cancelTransaction"
    />
    <password-modal
      v-if="isTransactionConfirmed"
      @confirm="sendConfirmedTransaction"
      @close="cancelTransaction"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { TransactionFactory } from '@/class';
import VForm from '@/components/ui/form/VForm.vue';
import VRadio from '@/components/ui/form/VRadio.vue';
import VSelect from '@/components/ui/form/VSelect';
import VInput from '@/components/ui/form/VInput.vue';
import VSpinner from '@/components/ui/VSpinner';
import VInputAddress from '@/components/ui/form/VInputAddress.vue';
import VButton from '@/components/ui/form/VButton.vue';
import AccountChooser from '@/components/AccountChooser';
import TransactionModal from '@/components/modal/TransactionModal';
import PasswordModal from '@/components/modal/PasswordModal';
import privatePage from '@/mixins/privatePage';
import { getShortStringWithEllipsis } from '@/utils/strings';
import TransactionForm from './TransactionForm';

const defaultTx = {
  tokenInfo: null,
  gasPrice: '40',
  gasLimit: '22000',
  value: '0',
  nonce: 0,
  to: '',
  data: '0x',
};

export default {
  data: () => ({
    transaction: { ...defaultTx },
    transactionHash: null,
    isSending: false,
    isWaitingConfirm: false,
    isTransactionConfirmed: false,
  }),

  computed: {
    ...mapState({
      activeAddress: state => state.accounts.address.getChecksumAddressString(),
      activeNet: state => state.web3.activeNet,
    }),
  },

  watch: {
    async activeAddress() {
      this.transactionHash = null;
      this.transaction.nonce = await this.getNextNonce();
    },

    async activeNet() {
      this.transactionHash = null;
      this.transaction.nonce = await this.getNextNonce();
    },
  },

  methods: {
    ...mapActions('transactions', ['sendTransaction', 'getNextNonce']),
    ...mapActions('gasPrice', ['getGasPrice']),

    handleTransactionSend() {
      this.isWaitingConfirm = true;
    },

    cancelTransaction() {
      this.isWaitingConfirm = false;
      this.isTransactionConfirmed = false;
    },

    async confirmTransaction() {
      this.isWaitingConfirm = false;
      this.isTransactionConfirmed = true;
    },

    async sendConfirmedTransaction(password) {
      this.isSending = true;

      Object.assign(this.transaction, {
        from: this.activeAddress,
        networkId: this.activeNet.id,
      });

      this.resetForm();
      this.isTransactionConfirmed = false;
      this.isWaitingConfirm = false;

      try {
        const hash = await this.sendTransaction({
          transaction: TransactionFactory.fromSendForm(this.transaction),
          password,
        });
        const shortHash = getShortStringWithEllipsis(hash);

        this.transactionHash = hash;

        this.$notify({
          title: 'Transaction Sent',
          text: `Transaction ${shortHash} sent`,
          type: 'is-info',
        });
      } catch (err) {
        this.transactionHash = null;
      } finally {
        this.isSending = false;
      }
    },

    async handleTransactionFormSubmit() {
      this.toggleTransactionModal();
    },

    async resetForm() {
      const nonce = await this.getNextNonce();

      this.transaction = {
        ...defaultTx,
        nonce,
      };
    },
  },

  async created() {
    this.transaction.nonce = await this.getNextNonce();
  },

  mixins: [privatePage],

  components: {
    VForm,
    VButton,
    VRadio,
    VSpinner,
    VInput,
    VInputAddress,
    VSelect,
    AccountChooser,
    TransactionModal,
    PasswordModal,
    TransactionForm,
  },
};
</script>

<style lang="scss">
.send-page {
  .send-amount {
    margin-top: 2em;
    margin-bottom: 2em;
  }

  .field-label {
    margin-bottom: 0;
  }
}
</style>
