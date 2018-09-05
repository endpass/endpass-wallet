<template>
  <div class="app-page send-page">
    <div class="section is-narrow">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Send ETH</h1>
          </div>
          <div class="card-content">
            <v-form id="sendEther" @submit="fetchAddress">
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label" for="address">To</label>
                </div>
                <div class="field-body">
                  <v-input-address v-model="transaction.to"
                           ref="address"
                           name="address"
                           id="address"
                           aria-describedby="address"
                           placeholder="0x... or ENS"
                           help="Address to send to"
                           :disabled="isSending"
                           required />
                </div>
              </div>
              <div class="send-amount field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label" for="amount">Amount</label>
                </div>
                <div class="field-body">
                  <v-input v-model="value"
                           type="number"
                           min="0"
                           step="any"
                           name="value"
                           :validator="`required|decimal:${decimal}|between:0,${maxAmount}`"
                           data-vv-as="amount"
                           id="value"
                           aria-describedby="value"
                           placeholder="Amount"
                           :disabled="isSending"
                           required>
                    <span class="select" slot="addon">
                      <v-select name="currencies" v-model="transaction.tokenInfo"
                                :options="tokenCurrencies"/>
                    </span>
                    <a slot="icon" title="Send entire balance" @click="setMaxAmount">
                      <span class="icon is-small is-right"
                        v-html="require('@/img/arrow-thick-top.svg')">
                      </span>
                    </a>
                  </v-input>
                  <v-input v-model="price"
                           type="number"
                           min="0"
                           step="0.01"
                           name="price"
                           :validator="`required|decimal:2|between:0,${maxPrice}`"
                           id="price"
                           aria-describedby="price"
                           placeholder="Price"
                           :disabled="isSending || !ethPrice"
                           required>
                    <div class="control" slot="addon">
                      <a class="button is-static">{{fiatCurrency}}</a>
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
                    name="priority"
                    :options="suggestedGasPrices"
                    id="priority"
                    v-model="transaction.gasPrice"
                    v-if="suggestedGasPrices"
                  ></v-radio>
                  <v-spinner v-else-if="isLoadingGasPrice" :is-loading="isLoadingGasPrice"/>
                  <p class="help is-danger" v-else>
                    Unable to load suggested gas price, please set gas price
                    manually.
                  </p>
                </div>
              </div>


              <div class="advanced-options-container">
                <div class="field advanced-toggle is-horizontal">
                  <div class="field-label"></div>
                  <div class="field-body">
                    <a class="has-text-link" @click="toggleShowAdvanced">
                      Advanced Options...
                    </a>
                  </div>
                </div>

                <div class="advanced-options" v-show="showAdvanced">
                  <div class="field is-horizontal">
                    <div class="field-label">
                      <label class="label">Gas Price</label>
                    </div>
                    <div class="field-body">
                      <v-input v-model="transaction.gasPrice"
                               name="gasPrice"
                               type="number"
                               min="1"
                               max="100"
                               step="1"
                               validator="required|numeric|integer|between:1,100"
                               id="gasPrice"
                               aria-describedby="gasPrice"
                               placeholder="Gas price"
                               :disabled="isSending"
                               required>
                        <div class="control" slot="addon">
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
                      <v-input v-model="transaction.gasLimit"
                               name="gasLimit"
                               type="number"
                               min="21000"
                               max="1000000"
                               step="1000"
                               validator="required|numeric|integer|between:21000,4000000"
                               id="gasLimit"
                               aria-describedby="gasLimit"
                               placeholder="Gas limit"
                               :disabled="isSending"
                               required />
                    </div>
                  </div>


                  <div class="field is-horizontal">
                    <div class="field-label">
                      <label class="label">Nonce</label>
                    </div>
                    <div class="field-body">
                      <v-input v-model="userNonce"
                               @input="setTrxNonce"
                               name="nonce"
                               type="number"
                               step="1"
                               :validator="`required|numeric|integer|min_value:${nextNonceInBlock}`"
                               id="nonce"
                               aria-describedby="nonce"
                               placeholder="Nonce"
                               :disabled="isSending"
                               required />
                    </div>
                  </div>


                  <div class="field is-horizontal">
                    <div class="field-label">
                      <label class="label">Data</label>
                    </div>
                    <div class="field-body">
                      <v-input v-show="!transaction.tokenInfo"
                               v-model="transaction.data"
                               name="data"
                               validator="required|hex"
                               id="data"
                               aria-describedby="data"
                               placeholder="Data"
                               :disabled="isSending"
                               required />
                    </div>
                  </div>
                </div>
              </div>

              <div class="field is-horizontal">
                <div class="field-label"></div>
                <div class="field-body">
                  <v-button className="is-success is-medium is-cta"
                            :loading="isSending"
                            :disabled="isSyncing">Send</v-button>
                </div>
              </div>
            </v-form>

            <div class="transaction-status message is-success" v-if="transactionHash">
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
    <transaction-modal v-if="isTransactionModal"
                       :transaction="transaction"
                       @confirm="confirmTransaction"
                       @close="toggleTransactionModal" />
    <password-modal v-if="isPasswordModal"
                       @confirm="confirmPassword"
                       @close="togglePasswordModal" />
  </div>
</template>

<script>
import { BigNumber } from 'bignumber.js';
import { Transaction } from '@/class';
import { mapState, mapActions, mapGetters } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VRadio from '@/components/ui/form/VRadio.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VSpinner from '@/components/ui/VSpinner';
import VInputAddress from '@/components/ui/form/VInputAddress.vue';
import VButton from '@/components/ui/form/VButton.vue';
import VSelect from '@/components/ui/form/VSelect';
import TransactionModal from '@/components/modal/TransactionModal';
import PasswordModal from '@/components/modal/PasswordModal';
import web3 from '@/utils/web3';

const defaultTnx = {
  gasPrice: '40',
  gasLimit: '22000',
  value: '0',
  tokenInfo: undefined,
  to: '',
  data: '0x',
};

export default {
  data: () => ({
    isSending: false,
    transaction: new Transaction(defaultTnx),
    estimateGasCost: 0,
    priceInFiat: '0.00',
    transactionHash: null,
    nextNonceInBlock: 0,
    userNonce: null,
    isLoadingGasPrice: true,
    lastInputPrice: 'amount',
    isTransactionModal: false,
    isPasswordModal: false,
    showAdvanced: false,
    suggestedGasPrices: null,
  }),
  computed: {
    ...mapState({
      tokenPrices: state => state.tokens.prices,
      balance: state => state.accounts.balance,
      address: state => state.accounts.address.getChecksumAddressString(),
      activeCurrency: state => state.web3.activeCurrency,
      activeNet: state => state.web3.activeNet,
      isSyncing: state => !!state.web3.isSyncing,
      fiatCurrency: state => state.accounts.settings.fiatCurrency,
      ethPrice: state => state.price.price || 0,
    }),
    ...mapGetters('tokens', ['tokensWithBalance']),
    value: {
      get() {
        const { value } = this.transaction;

        if (this.lastInputPrice === 'fiat' && value > 0) {
          const { price, ethPrice, decimal } = this;
          let tokenPrice = this.actualPrice;
          return BigNumber(price)
            .div(tokenPrice)
            .toFixed(decimal);
        }

        return value;
      },
      set(newValue) {
        this.transaction.value = newValue;
        this.lastInputPrice = 'amount';
        let price = this.actualPrice;
        this.priceInFiat = BigNumber(newValue || '0')
          .times(price)
          .toFixed(2);

        this.$nextTick(() => this.$validator.validate('price'));
      },
    },
    price: {
      get() {
        if (this.lastInputPrice === 'amount' && this.priceInFiat > 0) {
          const { value, ethPrice } = this;
          let price = this.actualPrice;
          return BigNumber(value)
            .times(price)
            .toFixed(2);
        }

        return this.priceInFiat;
      },
      set(newValue) {
        this.priceInFiat = newValue;
        this.lastInputPrice = 'fiat';
        let price = this.actualPrice;
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
    async resetForm() {
      this.$validator.pause();
      await this.$nextTick();
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
    confirmPassword(password) {
      this.isSending = true;
      this.transaction.from = this.address;
      this.togglePasswordModal();
      this.transaction.networkId = this.activeNet.id;
      this.sendTransaction({ transaction: this.transaction, password })
        .then(hash => {
          this.transactionHash = hash;
          this.isSending = false;
          this.resetForm();
          const shortHash = `${hash.slice(0, 4)}...${hash.slice(-4)}`;
          this.$notify({
            title: 'Transaction Sent',
            text: `Transaction ${shortHash} sent`,
            type: 'is-info',
          });
        })
        .catch(e => {
          this.isSending = false;
          this.resetForm();
        });
    },
    async fetchAddress() {
      this.isSending = true;
      try {
        await this.$refs.address.updateENS();
        this.toggleTransactionModal();
      } catch (e) {
        this.$notify({
          title: 'Error',
          text: e.message,
          type: 'is-warning',
        });
      }
      this.isSending = false;
    },
    confirmTransaction() {
      this.toggleTransactionModal();
      this.togglePasswordModal();
    },
    async updateEstimateGasCost() {
      this.estimateGasCost = await this.transaction.getFullPrice(web3.eth);
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
  watch: {
    'transaction.to': {
      async handler() {
        await this.$nextTick();
        await this.$nextTick();

        if (!this.errors.has('address')) {
          this.updateEstimateGasCost();
        }
      },
      immediate: true,
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
  },
  created() {
    this.updateUserNonce();
    this.getGasPrice()
      .then(prices => {
        this.suggestedGasPrices = [
          {
            val: prices.low.toString(),
            key: 'Low',
            help: prices.low + ' Gwei',
          },
          {
            val: prices.medium.toString(),
            key: 'Medium',
            help: prices.medium + ' Gwei',
          },
          {
            val: prices.high.toString(),
            key: 'High',
            help: prices.high + ' Gwei',
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
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  components: {
    VForm,
    VButton,
    VRadio,
    VSpinner,
    VInput,
    VInputAddress,
    VSelect,
    TransactionModal,
    PasswordModal,
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
