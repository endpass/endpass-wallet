<template>
  <div class="app-page send-page">
    <div class="section is-narrow">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Send ETH</h1>
          </div>
          <div class="card-content">
            <v-form
              id="sendEther"
              @submit="handleTransactionFormSubmit"
            >
              <div class="field">
                <label class="label">
                  To
                </label>
                <account-chooser
                  v-model="address"
                  :disabled="isSending"
                  :creatable="true"
                  :width="35"
                  :accounts="accountsOptions"
                  placeholder="0x... or ENS"
                />
                <p
                  v-if="ensError"
                  class="help is-danger"
                >
                  {{ ensError }}
                </p>
              </div>
              <div class="send-amount field is-horizontal">
                <div class="field-label is-normal">
                  <label
                    class="label"
                    for="amount"
                  >
                    Amount
                  </label>
                </div>
                <div class="field-body">
                  <v-input
                    id="value"
                    v-model="value"
                    :validator="`required|decimal:${decimal}|between:0,${maxAmount}`"
                    :disabled="isSending"
                    type="number"
                    min="0"
                    step="any"
                    name="value"
                    data-vv-as="amount"
                    aria-describedby="value"
                    placeholder="Amount"
                    required
                  >
                    <span
                      slot="addon"
                      class="select"
                    >
                      <v-select
                        v-model="transaction.tokenInfo"
                        :options="tokenCurrencies"
                        name="currencies"
                      />
                    </span>
                    <a
                      slot="icon"
                      title="Send entire balance"
                      @click="setMaxAmount"
                    >
                      <span
                        class="icon is-small is-right"
                        v-html="require('@/img/arrow-thick-top.svg')"
                      />
                    </a>
                  </v-input>
                  <v-input
                    id="price"
                    v-model="price"
                    :validator="`required|decimal:2|between:0,${maxPrice}`"
                    :disabled="isSending || !ethPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    aria-describedby="price"
                    placeholder="Price"
                    required
                  >
                    <div
                      slot="addon"
                      class="control"
                    >
                      <a class="button is-static">{{ fiatCurrency }}</a>
                    </div>
                  </v-input>
                </div>
              </div>

              <div class="priority-options field is-horizontal">
                <div class="field-label">
                  <label class="label">Priority</label>
                </div>
                <div class="field-body">
                  <v-radio
                    v-if="suggestedGasPrices"
                    id="priority"
                    :options="suggestedGasPrices"
                    v-model="transaction.gasPrice"
                    name="priority"
                  />
                  <v-spinner
                    v-else-if="isLoadingGasPrice"
                    :is-loading="isLoadingGasPrice"
                  />
                  <p
                    v-else
                    class="help is-danger"
                  >
                    Unable to load suggested gas price, please set gas price
                    manually.
                  </p>
                </div>
              </div>
              <div class="advanced-options-container">
                <div class="field advanced-toggle is-horizontal">
                  <div class="field-label" />
                  <div class="field-body">
                    <a
                      class="has-text-link"
                      @click="toggleShowAdvanced"
                    >
                      Advanced Options...
                    </a>
                  </div>
                </div>

                <div
                  v-show="showAdvanced"
                  class="advanced-options"
                >
                  <div class="field is-horizontal">
                    <div class="field-label">
                      <label class="label">Gas Price</label>
                    </div>
                    <div class="field-body">
                      <v-input
                        id="gasPrice"
                        v-model="transaction.gasPrice"
                        :disabled="isSending"
                        name="gasPrice"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        validator="required|numeric|integer|between:1,100"
                        aria-describedby="gasPrice"
                        placeholder="Gas price"
                        required
                      >
                        <div
                          slot="addon"
                          class="control"
                        >
                          <a class="button is-static">Gwei</a>
                        </div>
                      </v-input>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label">
                      <label class="label">Gas Limit</label>
                    </div>
                    <div class="field-body">
                      <v-input
                        id="gasLimit"
                        v-model="transaction.gasLimit"
                        :disabled="isSending"
                        name="gasLimit"
                        type="number"
                        min="21000"
                        max="1000000"
                        step="1000"
                        validator="required|numeric|integer|between:21000,4000000"
                        aria-describedby="gasLimit"
                        placeholder="Gas limit"
                        required
                      />
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label">
                      <label class="label">Nonce</label>
                    </div>
                    <div class="field-body">
                      <v-input
                        id="nonce"
                        v-model="userNonce"
                        :validator="`required|numeric|integer|min_value:${nextNonceInBlock}`"
                        :disabled="isSending"
                        name="nonce"
                        type="number"
                        step="1"
                        aria-describedby="nonce"
                        placeholder="Nonce"
                        required
                        @input="setTrxNonce"
                      />
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label">
                      <label class="label">Data</label>
                    </div>
                    <div class="field-body">
                      <v-input
                        v-show="!transaction.tokenInfo"
                        id="data"
                        v-model="transaction.data"
                        :disabled="isSending"
                        name="data"
                        validator="required|hex"
                        aria-describedby="data"
                        placeholder="Data"
                        required />
                    </div>
                  </div>
                </div>
              </div>

              <div class="field is-horizontal">
                <div class="field-label" />
                <div class="field-body">
                  <v-button
                    :loading="isSending"
                    :disabled="!isSendAllowed"
                    class-name="is-success is-medium is-cta"
                    data-test="transaction-send-button"
                  >
                    Send
                  </v-button>
                </div>
              </div>
            </v-form>

            <div
              v-if="transactionHash"
              class="transaction-status message is-success"
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
      v-if="isTransactionModal"
      :transaction="transaction"
      @confirm="confirmTransaction"
      @close="toggleTransactionModal"
    />
    <password-modal
      v-if="isPasswordModal"
      @confirm="confirmTransactionSend"
      @close="togglePasswordModal"
    />
  </div>
</template>

<script>
import { BigNumber } from 'bignumber.js';
import { Transaction, ENSResolver } from '@/class';
import { mapState, mapActions, mapGetters } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VRadio from '@/components/ui/form/VRadio.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VSpinner from '@/components/ui/VSpinner';
import VInputAddress from '@/components/ui/form/VInputAddress.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VSelect from '@/components/ui/form/VSelect';
import AccountChooser from '@/components/AccountChooser';
import TransactionModal from '@/components/modal/TransactionModal';
import PasswordModal from '@/components/modal/PasswordModal';
import web3, { isAddressOfContract } from '@/utils/web3';
import { getShortStringWithEllipsis } from '@/utils/strings';
import { uniq } from '@/utils/arrays';

const defaultTnx = {
  gasPrice: '40',
  gasLimit: '22000',
  value: '0',
  tokenInfo: undefined,
  to: '',
  data: '0x',
};

export default {
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
  },

  data: () => ({
    address: '',
    isSending: false,
    transaction: new Transaction(defaultTnx),
    estimateGasCost: 0,
    priceInFiat: '0.00',
    transactionHash: null,
    nextNonceInBlock: 0,
    userNonce: null,
    isLoadingGasPrice: true,
    isEnsAddressLoading: false,
    lastInputPrice: 'amount',
    isTransactionModal: false,
    isPasswordModal: false,
    showAdvanced: false,
    suggestedGasPrices: null,
    ensError: null,
  }),

  computed: {
    ...mapState({
      wallets: state => state.accounts.wallets,
      tokenPrices: state => state.tokens.prices,
      balance: state => state.accounts.balance,
      activeAddress: state => state.accounts.address.getChecksumAddressString(),
      activeCurrency: state => state.web3.activeCurrency,
      activeNet: state => state.web3.activeNet,
      isSyncing: state => !!state.connectionStatus.isSyncing,
      fiatCurrency: state => state.user.settings.fiatCurrency,
      ethPrice: state => state.price.price || 0,
    }),
    ...mapGetters('tokens', ['tokensWithBalance']),
    ...mapGetters('transactions', ['getAddressesFromTransactions']),
    value: {
      get() {
        const { value } = this.transaction;

        if (this.lastInputPrice === 'fiat' && value > 0) {
          const tokenPrice = this.actualPrice;
          const { price, decimal } = this;

          return BigNumber(price)
            .div(tokenPrice)
            .toFixed(decimal);
        }

        return value;
      },
      set(newValue) {
        const price = this.actualPrice;

        this.transaction.value = newValue;
        this.lastInputPrice = 'amount';
        this.priceInFiat = BigNumber(newValue || '0')
          .times(price)
          .toFixed(2);

        this.$nextTick(() => this.$validator.validate('price'));
      },
    },
    price: {
      get() {
        if (this.lastInputPrice === 'amount' && this.priceInFiat > 0) {
          const { value } = this;
          const price = this.actualPrice;

          return BigNumber(value)
            .times(price)
            .toFixed(2);
        }

        return this.priceInFiat;
      },
      set(newValue) {
        const price = this.actualPrice;

        this.priceInFiat = newValue;
        this.lastInputPrice = 'fiat';
        this.transaction.value = BigNumber(newValue || '0')
          .div(price)
          .toFixed(newValue > 0 ? this.decimal : 0);

        this.$nextTick(() => this.$validator.validate('value'));
      },
    },
    actualPrice() {
      let price;
      if (this.transaction.tokenInfo) {
        price =
          this.tokenPrices[this.transaction.tokenInfo.symbol] &&
          this.tokenPrices[this.transaction.tokenInfo.symbol][
            this.activeCurrency.name
          ]
            ? BigNumber(
                this.tokenPrices[this.transaction.tokenInfo.symbol][
                  this.activeCurrency.name
                ],
              ).times(this.ethPrice)
            : 0;
      } else {
        price = this.ethPrice;
      }
      return price.toFixed();
    },
    accountsOptions() {
      const { wallets, getAddressesFromTransactions } = this;

      return uniq(Object.keys(wallets).concat(getAddressesFromTransactions));
    },
    maxAmount() {
      if (this.transaction.tokenInfo) {
        return this.transaction.tokenInfo.balance || '0';
      }

      const { fromWei } = web3.utils;
      const balanceBN = BigNumber(this.balance || '0');
      const estimateGasCostBN = BigNumber(this.estimateGasCost || '0');
      const amountBN = balanceBN.minus(estimateGasCostBN);
      const amount = fromWei(amountBN.toFixed());

      return amount > 0 ? amount : 0;
    },
    maxPrice() {
      const balance = new BigNumber(this.maxAmount);
      const amount = balance
        .times(this.ethPrice)
        .minus('0.01')
        .toFixed(2);
      return amount > 0 ? amount : 0;
    },
    decimal() {
      const { tokenInfo } = this.transaction;
      return (tokenInfo && tokenInfo.decimals) || 18;
    },
    tokenCurrencies() {
      const currencies = [
        {
          val: null,
          key: this.activeCurrency.name,
          text: this.activeCurrency.name,
        },
      ];

      return currencies.concat(
        this.tokensWithBalance.map(({ symbol }) => symbol),
      );
    },
    isEnsTransaction() {
      return /^.+\.(eth|etc|test)$/.test(this.address);
    },
    isSendAllowed() {
      return (
        this.transaction.to &&
        !this.isSyncing &&
        !this.ensError &&
        !this.isEnsAddressLoading
      );
    },
  },

  watch: {
    async address() {
      if (this.isEnsTransaction) {
        this.transaction.to = await this.getEnsAddress();
        this.updateEstimateGasCost();
      } else if (!this.errors.has('address')) {
        this.ensError = null;
        this.transaction.to = this.address;
        this.updateEstimateGasCost();
      }
    },

    'transaction.data': {
      async handler() {
        await this.$nextTick();
        await this.$nextTick();

        if (!this.errors.has('data')) {
          this.updateEstimateGasCost();
        }
      },
    },
    'transaction.tokenInfo': () => {
      this.updateEstimateGasCost();
    },

    async activeNet(newValue, prevValue) {
      if (this.isEnsTransaction && newValue.id !== prevValue.id) {
        this.transaction.to = await this.getEnsAddress();
      }
    },
  },

  created() {
    this.updateUserNonce();
    this.getGasPrice()
      .then(prices => {
        this.suggestedGasPrices = [
          {
            val: prices.low.toString(),
            key: 'Low',
            help: `${prices.low} Gwei`,
          },
          {
            val: prices.medium.toString(),
            key: 'Medium',
            help: `${prices.medium} Gwei`,
          },
          {
            val: prices.high.toString(),
            key: 'High',
            help: `${prices.high} Gwei`,
          },
        ];
        this.transaction.gasPrice = prices.medium.toString();
      })
      .catch(() => {
        this.isLoadingGasPrice = false;
      });

    this.interval = setInterval(async () => {
      this.nextNonceInBlock = await this.getNonceInBlock();
      this.$validator.validate('nonce');
    }, 2000);

    this.$watch(
      vm => [vm.balance, vm.$data.estimateGasCost].join(),
      () => {
        if (BigNumber(this.estimateGasCost).gt(this.balance)) {
          this.errors.add({
            field: 'value',
            msg: 'Insufficient funds',
            id: 'insufficientBalance',
          });
        } else {
          this.errors.removeById('insufficientBalance');
        }
      },
    );

    this.$watch(
      vm => [vm.activeNet.id, vm.address].join(),
      this.updateUserNonce,
    );

    this.$ens = new ENSResolver(web3);
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    ...mapActions('transactions', [
      'sendTransaction',
      'getNextNonce',
      'getNonceInBlock',
    ]),
    ...mapActions('gasPrice', ['getGasPrice']),
    setTrxNonce(nonce) {
      this.transaction.nonce = nonce;
    },
    async getEnsAddress() {
      this.isEnsAddressLoading = true;

      try {
        const ensAddress = await this.$ens.getAddress(this.address);
        this.ensError = null;

        return ensAddress;
      } catch (err) {
        this.ensError = `ENS ${this.address} can not be resolved.`;

        return '';
      } finally {
        this.isEnsAddressLoading = false;
      }
    },
    async resetForm() {
      this.$validator.pause();
      await this.$nextTick();
      this.address = '';
      this.transaction = new Transaction(defaultTnx);
      await this.$nextTick();
      this.$validator.resume();
      this.$validator.flag('address', {
        valid: false,
      });
      this.updateUserNonce();
    },

    toggleTransactionModal() {
      this.isTransactionModal = !this.isTransactionModal;
    },
    togglePasswordModal() {
      this.isPasswordModal = !this.isPasswordModal;
    },
    toggleShowAdvanced() {
      this.showAdvanced = !this.showAdvanced;
    },
    requestPassword() {
      this.togglePasswordModal();
    },
    async confirmTransactionSend(password) {
      this.isSending = true;
      this.transaction.from = this.activeAddress;
      this.transaction.networkId = this.activeNet.id;

      this.togglePasswordModal();

      try {
        const hash = await this.sendTransaction({
          transaction: this.transaction,
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
        this.$notify({
          title: 'Error',
          text: err.message,
          type: 'is-warning',
        });
      } finally {
        this.isSending = false;
        this.resetForm();
      }
    },

    async handleTransactionFormSubmit() {
      this.toggleTransactionModal();
    },

    confirmTransaction() {
      this.toggleTransactionModal();
      this.togglePasswordModal();
    },
    async updateEstimateGasCost() {
      const { transaction } = this;

      try {
        this.estimateGasCost = await transaction.getFullPrice(web3.eth);
      } catch (err) {
        const isContract = await isAddressOfContract(transaction.to);

        if (!isContract && err.message.includes('always failing transaction')) {
          this.ensError = 'Transaction will always fail, try other address.';
        }
      }
    },
    updateUserNonce() {
      this.getNextNonce().then(nonce => {
        this.userNonce = nonce;
      });
    },
    // Sets transaction value to the maximum amount
    setMaxAmount() {
      this.value = this.maxAmount;
    },
  },
};
</script>

<style lang="scss">
.advanced-options-container {
}
.advanced-options {
  overflow: hidden;
  height: auto;
  max-height: 1000px;

  display: inherit !important; /* override v-show display: none */
  transition: max-height 0.3s ease-in-out;
}
.advanced-options[style*='display: none;'] {
  max-height: 0;
  pointer-events: none; /* disable user interaction */
  user-select: none; /* disable user selection */
}

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
