<template>
  <v-form
    id="sendEther"
    data-test="transaction-send-form"
    @submit="handleFormSubmit"
    :isFormValid="isSendAllowed && isFormValid"
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
      :is-loading="isLoading"
      :show-fee="!!transaction.to"
      @change-token="changeTokenInfo"
    />

    <transaction-priority-options
      v-if="prices"
      v-model="transaction.gasPrice"
      :is-loading="isLoadingGasPrice"
      :prices="prices"
    />

    <transaction-advanced-options
      v-if="!isLoadingGasPrice"
      :transaction="transaction"
      :current-token="transaction.tokenInfo"
      :is-loading="isLoading"
      :is-opened="!prices"
      @change="handleAdvancedChange"
    />

    <div class="field is-horizontal">
      <div class="field-label" />
      <div class="field-body">
        <v-button
          :disabled="!isFormValid || !isSendAllowed"
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
import { debounce } from 'lodash';
import { mapGetters, mapState, mapActions } from 'vuex';
import { ENSResolver, Transaction } from '@/class';
import AccountChooser from '@/components/AccountChooser';
import TransactionAdvancedOptions from './TransactionAdvancedOptions';
import TransactionAmountOptions from './TransactionAmountOptions';
import TransactionPriorityOptions from './TransactionPriorityOptions';
import formMixin from '@/mixins/form';

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
    address: '',
    prices: null,
    estimatedGasCost: 0,
    ensError: null,
    isEnsAddressLoading: false,
    isLoadingGasPrice: true,
    isEstimationInProcess: false,
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
      const {
        transaction,
        ensError,
        isSyncing,
        isEnsAddressLoading,
        isEstimationInProcess,
      } = this;

      return (
        transaction.to &&
        !isSyncing &&
        !ensError &&
        !isEnsAddressLoading &&
        !isEstimationInProcess
      );
    },
  },

  watch: {
    async address() {
      if (this.isEnsTransaction) {
        this.transaction.to = await this.resolveEnsAddress();
      } else if (!this.errors.has('address') && this.address) {
        this.ensError = null;
        this.transaction.to = this.address;
      }

      this.debouncedGasCostEstimation(1);
    },

    async activeNet(newValue, prevValue) {
      const isNetworkChanged = newValue.id !== prevValue.id;

      if (!isNetworkChanged) return;

      if (this.isEnsTransaction) {
        this.transaction.to = await this.resolveEnsAddress();
      }

      this.debouncedGasCostEstimation();
    },

    'transaction.tokenInfo': {
      handler() {
        this.debouncedGasCostEstimation();
      },
    },

    'transaction.gasPrice': {
      handler() {
        this.debouncedGasCostEstimation();
      },
    },

    'transaction.gasLimit': {
      handler() {
        this.debouncedGasCostEstimation();
      },
    },

    'transaction.to': {
      handler() {
        if (!this.transaction.to) {
          this.address = '';
        }
      },
    },
  },

  methods: {
    ...mapActions('gasPrice', ['getGasPrice']),

    changeTokenInfo(value) {
      const tokenInfo = value ? this.currentAccountTokenBySymbol(value) : null;
      this.$set(this.transaction, 'tokenInfo', tokenInfo);
    },

    handleFormSubmit() {
      this.emitTransactionSubmit();
    },

    async resolveEnsAddress() {
      this.isEnsAddressLoading = true;

      try {
        const ensAddress = await ENSResolver.getAddress(this.address);

        this.ensError = null;

        return ensAddress;
      } catch (err) {
        this.ensError = `ENS ${this.address} can not be resolved.`;

        return '';
      } finally {
        this.isEnsAddressLoading = false;
      }
    },

    debouncedGasCostEstimation: debounce(function() {
      this.estimateGasCost();
    }, 500),

    async estimateGasCost() {
      if (!this.transaction.to) return;

      this.isEstimationInProcess = true;

      try {
        this.estimatedGasCost = await Transaction.getGasFullPrice(
          this.transaction,
        );
      } catch (err) {
        // TODO: check send on main net. If it is ok, disallow sending
        console.log(err);

        const isContract = await Transaction.isToContract(this.transaction);

        if (!isContract && err.message.includes('always failing transaction')) {
          this.ensError = 'Transaction will always fail, try other address.';
        }

        this.estimatedGasCost = 0;
      } finally {
        this.isEstimationInProcess = false;
      }
    },

    handleAdvancedChange(options) {
      Object.assign(this.transaction, options);
    },

    async loadGasPrice() {
      this.isLoadingGasPrice = true;

      try {
        this.prices = await this.getGasPrice();
        this.transaction.gasPrice = this.prices.medium.toString();
      } catch (err) {
        this.prices = null;
        this.transaction.gasPrice = '0';
      } finally {
        this.isLoadingGasPrice = false;
      }
    },

    emitTransactionSubmit() {
      this.$emit('submit', this.transaction);
    },
  },

  async created() {
    await this.loadGasPrice();
  },
  mixins: [formMixin],
  components: {
    AccountChooser,
    TransactionAdvancedOptions,
    TransactionAmountOptions,
    TransactionPriorityOptions,
  },
};
</script>

<style>
</style>
