<template>
  <v-form
    id="sendEther"
    :is-form-valid="isSendAllowed && isFormValid"
    data-test="transaction-send-form"
    @submit="handleFormSubmit"
  >
    <div class="field">
      <label class="label">
        {{ $t('components.transactionForm.to') }}
      </label>
      <account-chooser
        v-model="address"
        :disabled="isLoading || isEnsAddressLoading"
        :creatable="true"
        :width="35"
        :accounts="allowedToSendAddresses"
        :placeholder="$t('components.transactionForm.ens')"
        data-test="transaction-address-select"
      />
      <p
        v-if="isEnsTransaction && !ensError && !isEnsAddressLoading"
        class="help ellipsis"
      >
        {{
          $t('components.transactionForm.resolvedAddress', {
            address: transaction.to,
          })
        }}
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
      :current-token="transaction.token"
      :fiat-currency="fiatCurrency"
      :eth-price="ethPrice"
      :gas-limit="transaction.gasLimit"
      :balance="balance"
      :gas-price="transaction.gasPrice"
      :disabled="!address"
      :active-net="activeNet"
      :is-loading="isLoading"
      :show-fee="!!transaction.to"
      @change-token="changeToken"
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
      :current-token="transaction.token"
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
          {{ $t('components.transactionForm.send') }}
        </v-button>
      </div>
    </div>
  </v-form>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { ENSResolver } from '@/class';
import formMixin from '@/mixins/form';
import AccountChooser from '@/components/AccountChooser';
import TransactionAdvancedOptions from './TransactionAdvancedOptions.vue';
import TransactionAmountOptions from './TransactionAmountOptions.vue';
import TransactionPriorityOptions from './TransactionPriorityOptions.vue';

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
    },

    async activeNet(newValue, prevValue) {
      const isNetworkChanged = newValue.id !== prevValue.id;

      if (!isNetworkChanged) return;

      if (this.isEnsTransaction) {
        this.transaction.to = await this.resolveEnsAddress();
      }
    },

    'transaction.to': {
      handler(newValue) {
        if (!newValue) {
          this.address = '';
        }
      },
    },
  },

  methods: {
    ...mapActions('gasPrice', ['getGasPrice']),

    changeToken(value) {
      const token = value ? this.currentAccountTokenBySymbol(value) : null;

      this.transaction.token = token;
      this.transaction.value = 0;
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
        this.ensError = this.$t('components.transactionForm.cantBeResolved', {
          address: this.address,
        });

        return '';
      } finally {
        this.isEnsAddressLoading = false;
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

<style></style>
