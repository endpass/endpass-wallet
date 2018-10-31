<template>
  <v-form
    id="sendEther"
    data-test="transaction-send-form"
    @submit="handleFormSubmit"
  >
    <div class="field">
      <label class="label">
        To
      </label>
      <account-chooser
        v-model="address"
        :disabled="isLoading || isEnsAddressLoading"
        :creatable="true"
        :width="35"
        :accounts="allowedToSendAddresses"
        placeholder="0x... or ENS"
        data-test="transaction-address-select"
      />
      <p
        v-if="isEnsTransaction && !ensError && !isEnsAddressLoading"
        class="help ellipsis"
      >
        Resolved ENS address: {{ transaction.to }}
      </p>
      <p
        v-if="ensError && !isEnsAddressLoading"
        class="help is-danger"
      >
        {{ ensError }}
      </p>
    </div>

    <transaction-amount-options
      v-model="transaction.value"
      :tokens-currencies="currentAccountTokensCurrencies"
      :current-token="transaction.tokenInfo"
      :fiat-currency="fiatCurrency"
      :eth-price="ethPrice"
      :balance="balance"
      :estimated-gas-cost="estimatedGasCost"
      :disabled="!address"
      :active-net="activeNet"
      @change-token="changeTokenInfo"
    />

    <transaction-priority-options
      v-model="transaction.gasPrice"
      :is-loading="isLoadingGasPrice"
      :prices="prices"
    />

    <transaction-advanced-options
      :transaction="transaction"
      @change="handleAdvancedChange"
    />

    <div class="field is-horizontal">
      <div class="field-label" />
      <div class="field-body">
        <v-button
          :disabled="!isSendAllowed"
          :loading="isLoading"
          class-name="is-success is-medium is-cta"
          data-test="transaction-send-button"
        >
          Send
        </v-button>
      </div>
    </div>
  </v-form>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import web3, { isAddressOfContract } from '@/utils/web3';
import { ENSResolver } from '@/class';
import VForm from '@/components/ui/form/VForm.vue';
import VRadio from '@/components/ui/form/VRadio.vue';
import VSelect from '@/components/ui/form/VSelect';
import VInput from '@/components/ui/form/VInput.vue';
import VSpinner from '@/components/ui/VSpinner';
import VInputAddress from '@/components/ui/form/VInputAddress.vue';
import VButton from '@/components/ui/form/VButton.vue';
import AccountChooser from '@/components/AccountChooser';
import TransactionAdvancedOptions from './TransactionAdvancedOptions';
import TransactionAmountOptions from './TransactionAmountOptions';
import TransactionPriorityOptions from './TransactionPriorityOptions';

export default {
  name: 'TransactionForm',

  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },

    transaction: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    ensResolver: new ENSResolver(web3),

    address: '',

    prices: null,

    estimatedGasCost: 0,
    ensError: null,
    isEnsAddressLoading: false,
    isLoadingGasPrice: true,
    nonceInterval: null,
  }),

  computed: {
    ...mapState({
      balance: state => state.accounts.balance,
      activeNet: state => state.web3.activeNet,
      fiatCurrency: state => state.user.settings.fiatCurrency,
      ethPrice: state => state.price.price || 0,
      isSyncing: state => !!state.connectionStatus.isSyncing,
    }),
    ...mapGetters('transactions', ['allowedToSendAddresses']),
    ...mapGetters('tokens', [
      'currentAccountTokensCurrencies',
      'currentAccountTokenBySymbol',
    ]),

    isEnsTransaction() {
      return /^.+\.(eth|etc|test)$/.test(this.address);
    },

    isSendAllowed() {
      const { transaction, isSyncing, isEnsAddressLoading, ensError } = this;

      return transaction.to && !isSyncing && !ensError && !isEnsAddressLoading;
    },
  },

  watch: {
    async address() {
      if (this.isEnsTransaction) {
        this.transaction.to = await this.resolveEnsAddress();
        this.estimateGasCost();
      } else if (!this.errors.has('address') && this.address) {
        this.ensError = null;
        this.transaction.to = this.address;
        this.estimateGasCost();
      }
    },

    async activeNet(newValue, prevValue) {
      if (this.isEnsTransaction && newValue.id !== prevValue.id) {
        this.transaction.to = await this.getEnsAddress();
      }
    },

    'transaction.tokenInfo': {
      handler() {
        this.estimateGasCost();
      },
    },

    'transaction.to': {
      handler() {
        if (this.address !== this.transaction.to) {
          this.address = this.transaction.to;
        }
      },
    },
  },

  methods: {
    ...mapActions('gasPrice', ['getGasPrice']),

    changeTokenInfo(value) {
      if (value) {
        const tokenInfo = this.currentAccountTokenBySymbol(value);

        this.$set(this.transaction, 'tokenInfo', tokenInfo);
      } else {
        this.$set(this.transaction, 'tokenInfo', null);
      }
    },

    handleFormSubmit() {
      this.emitTransactionSubmit();
    },

    async resolveEnsAddress() {
      this.isEnsAddressLoading = true;

      try {
        const ensAddress = await this.ensResolver.getAddress(this.address);

        this.ensError = null;

        return ensAddress;
      } catch (err) {
        this.ensError = `ENS ${this.address} can not be resolved.`;

        return '';
      } finally {
        this.isEnsAddressLoading = false;
      }
    },

    async estimateGasCost() {
      try {
        this.estimatedGasCost = await this.transaction.getFullPrice();
      } catch (err) {
        const isContract = await isAddressOfContract(this.transaction.to);

        if (!isContract && err.message.includes('always failing transaction')) {
          this.ensError = 'Transaction will always fail, try other address.';
        }
      }
    },

    handleAdvancedChange(options) {
      Object.assign(this.transaction, options);
    },

    async loadGasPrice() {
      this.isLoadingGasPrice = true;

      this.prices = await this.getGasPrice();
      this.transaction.gasPrice = this.prices.medium.toString();

      this.isLoadingGasPrice = false;
    },

    emitTransactionSubmit() {
      this.$emit('submit', this.transaction);
    },
  },

  async created() {
    await this.loadGasPrice();
  },

  components: {
    VForm,
    VRadio,
    VSelect,
    VInput,
    VSpinner,
    VInputAddress,
    VButton,
    AccountChooser,
    TransactionAdvancedOptions,
    TransactionAmountOptions,
    TransactionPriorityOptions,
  },
};
</script>

<style>
</style>
