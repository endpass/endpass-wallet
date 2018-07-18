<template>
  <div class="app-page send-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Send ETH</h1>
          </div>
          <div class="card-content">
            <v-form id="sendEther">

              <v-input v-model="transaction.to"
                       label="To"
                       name="address"
                       validator="required|address"
                       id="address"
                       aria-describedby="address"
                       placeholder="0x..."
                       help="Address to send to"
                       :disabled="isSending"
                       required />

              <div class="columns">
                <div class="column is-half is-full-mobile">
                  <v-input v-model="value"
                          label="Amount"
                          type="number"
                          name="value"
                          :validator="`required|decimal:${decimal}|between:0,${maxAmount}`"
                          data-vv-as="amount"
                          id="value"
                          aria-describedby="value"
                          placeholder="Amount"
                          :disabled="isSending"
                          required>
                    <span class="select" slot="addon">
                      <select v-model="transaction.tokenInfo">
                        <option :value="undefined">ETH</option>
                        <option
                          :value="token"
                          v-for="token in tokens"
                          :key="token.address">{{token.symbol}}</option>
                      </select>
                    </span>
                  </v-input>
                </div>
                <div class="column is-half is-full-mobile">
                  <v-input v-model="price"
                          label="Price"
                          type="number"
                          name="price"
                          :validator="`required|decimal:2|between:0,${maxPrice}`"
                          id="price"
                          aria-describedby="price"
                          placeholder="Price"
                          :disabled="isSending"
                          required>
                    <div class="control" slot="addon">
                      <a class="button is-static">{{fiatCurrency}}</a>
                    </div>
                  </v-input>
                </div>
              </div>

              <v-input v-model="transaction.gasPrice"
                       label="Gas price"
                       name="gasPrice"
                       type="number"
                       validator="required|numeric|integer|between:0,100"
                       id="gasPrice"
                       aria-describedby="gasPrice"
                       placeholder="Gas price"
                       :disabled="isSending"
                       required>
                <div class="control" slot="addon">
                  <a class="button is-static">Gwei</a>
                </div>
              </v-input>

              <v-input v-model="transaction.gasLimit"
                       label="Gas limit"
                       name="gasLimit"
                       type="number"
                       validator="required|numeric|integer|between:21000,4000000"
                       id="gasLimit"
                       aria-describedby="gasLimit"
                       placeholder="Gas limit"
                       :disabled="isSending"
                       required />

              <v-input v-model="userNonce"
                       @input="setTrxNonce"
                       label="Nonce"
                       name="nonce"
                       type="number"
                       :validator="`required|numeric|integer|min_value:${nextNonceInBlock}`"
                       id="nonce"
                       aria-describedby="nonce"
                       placeholder="Nonce"
                       :disabled="isSending"
                       required />

              <v-input v-show="selectedToken === 'ETH'"
                       v-model="transaction.data"
                       label="Data"
                       name="data"
                       validator="required|hex"
                       id="data"
                       aria-describedby="data"
                       placeholder="Data"
                       :disabled="isSending"
                       required />

              <v-button @click.prevent="toggleTransactionModal"
                        className="is-primary is-medium"
                        :loading="isSending"
                        :disabled="isSyncing">Send</v-button>

              <div v-if="transactionHash">{{ transactionHash }}</div>
            </v-form>
          </div>
        </div>
      </div>
    </div>
    <transaction-modal v-if="isTransactionModal"
                       :transaction="transaction"
                       :token="selectedToken"
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
import { mapState, mapActions } from 'vuex';
import web3 from 'web3';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import TransactionModal from '@/components/modal/TransactionModal';
import PasswordModal from '@/components/modal/PasswordModal';

const defaultTnx = {
  gasPrice: '90',
  gasLimit: '22000',
  value: '0',
  tokenInfo: undefined,
  to: '',
  data: '0x',
};

export default {
  data: () => ({
    selectedToken: 'ETH',
    isSending: false,
    transaction: new Transaction(defaultTnx),
    estimateGasCost: 0,
    priceInFiat: '0.00',
    transactionHash: null,
    nextNonceInBlock: 0,
    userNonce: null,
    lastInputPrice: 'amount',
    isTransactionModal: false,
    isPasswordModal: false,
  }),
  computed: {
    ...mapState({
      balance: state => state.accounts.balance,
      address: state => state.accounts.address.getAddressString(),
      tokens: state => state.tokens.activeTokens,
      web3: state => state.web3.web3,
      isSyncing: state => !!state.web3.isSyncing,
      fiatCurrency: state => state.accounts.settings.fiatCurrency,
      ethPrice: state => state.price.price,
    }),
    value: {
      get() {
        const { value } = this.transaction;

        if (this.lastInputPrice === 'fiat' && value > 0) {
          const { price, ethPrice, decimal } = this;
          return BigNumber(price)
            .div(ethPrice)
            .toFixed(decimal);
        }

        return value;
      },
      set(newValue) {
        this.transaction.value = newValue;
        this.lastInputPrice = 'amount';
        this.priceInFiat = BigNumber(newValue || '0')
          .times(this.ethPrice)
          .toFixed(2);

        this.$nextTick(() => this.$validator.validate('price'));
      },
    },
    price: {
      get() {
        if (this.lastInputPrice === 'amount' && this.priceInFiat > 0) {
          const { value, ethPrice } = this;
          return BigNumber(value)
            .times(ethPrice)
            .toFixed(2);
        }

        return this.priceInFiat;
      },
      set(newValue) {
        this.priceInFiat = newValue;
        this.lastInputPrice = 'fiat';
        this.transaction.value = BigNumber(newValue || '0')
          .div(this.ethPrice)
          .toFixed(newValue > 0 ? this.decimal : 0);

        this.$nextTick(() => this.$validator.validate('value'));
      },
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
  },
  methods: {
    ...mapActions('transactions', [
      'sendTransaction',
      'getNextNonce',
      'getNonceInBlock',
    ]),
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
    requestPassword() {
      this.togglePasswordModal();
    },
    confirmPassword(password) {
      this.isSending = true;
      this.transaction.from = this.address;
      this.togglePasswordModal();
      this.sendTransaction({ transaction: this.transaction, password })
        .then(hash => {
          this.transactionHash = hash;
          this.isSending = false;
          this.resetForm();
          const shortHash = `${hash.slice(0, 4)}...${hash.slice(-4)}`;
          this.$notify({
            title: 'Successful',
            text: `Transaction ${shortHash} was sent`,
            type: 'is-info',
          });
        })
        .catch(e => {
          this.isSending = false;
          this.resetForm();
        });
    },
    confirmTransaction() {
      this.toggleTransactionModal();
      this.togglePasswordModal();
    },
    async updateEstimateGasCost() {
      this.estimateGasCost = await this.transaction.getFullPrice(this.web3.eth);
    },
    updateUserNonce() {
      this.getNextNonce().then(nonce => {
        this.userNonce = nonce;
      });
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
    selectedToken() {
      this.updateEstimateGasCost();
    },
  },
  created() {
    this.updateUserNonce();

    this.interval = setInterval(async () => {
      this.nextNonceInBlock = await this.getNonceInBlock();
      this.$validator.validate('nonce')
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  components: {
    VForm,
    VButton,
    VInput,
    TransactionModal,
    PasswordModal,
  },
};
</script>

<style lang="scss">
</style>
