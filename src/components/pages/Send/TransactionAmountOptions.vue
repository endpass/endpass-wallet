<template>
  <div class="send-amount ">
    <div
      class="field is-horizontal"
      data-test="transaction-amount-group-field"
    >
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
          v-validate="`required|decimal:${decimal}|between:0,${maxAmount}`"
          id="value"
          :value="value"
          :error="errors.first('value')"
          :disabled="isLoading || disabled"
          type="number"
          data-vv-as="amount"
          min="0"
          step="any"
          name="value"
          data-vv-name="value"
          aria-describedby="value"
          placeholder="Amount"
          required
          data-test="transaction-amount-input"
          @input="handleAmountInput"
        >
          <span
            slot="addon"
            class="select"
          >
            <v-select
              :value="currentTokenSymbol"
              :options="tokensCurrencies"
              :disabled="disabled"
              name="currencies"
              @input="emitChangeTokenInfo"
            />
          </span>
          <a
            slot="icon"
            title="Send entire balance"
            role="button"
            class="amount-max-button icon is-small is-right"
            @click="setMaxAmount"
            v-html="require('@/img/arrow-thick-top.svg')"
          />
        </v-input>

        <v-input
          v-validate="`required|decimal:2|between:0,${maxPrice}`"
          id="price"
          :value="price"
          :error="errors.first('price')"
          :disabled="!ethPrice || disabled"
          type="number"
          min="0"
          step="0.01"
          name="price"
          data-vv-name="price"
          aria-describedby="price"
          placeholder="Price"
          required
          @input="handlePriceInput"
        >
          <div
            slot="addon"
            class="amount-fiat-currency control"
          >
            {{ fiatCurrency }}
          </div>
        </v-input>
      </div>
    </div>
    <div
      v-show="showFee"
      class="field is-horizontal"
    >
      <div class="field-label">
        <label class="label">Gas Fee</label>
      </div>
      <div class="field-body">
        <v-input
          :value="gasFee"
          :disabled="true"
          name="gasFee"
          data-vv-name="gasFee"
          type="number"
        />
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import { BigNumber } from 'bignumber.js';
import { fromWei, toWei } from 'web3-utils';

export default {
  name: 'TransactionAmountOptions',

  inject: ['$validator'],

  props: {
    value: {
      type: [String, Number],
      required: true,
    },

    ethPrice: {
      type: [String, Number],
      required: true,
    },

    fiatCurrency: {
      type: String,
      required: true,
    },

    activeNet: {
      type: Object,
      required: true,
    },

    tokensCurrencies: {
      type: Array,
      default: () => [],
    },

    currentToken: {
      type: Object,
      default: null,
    },

    balance: {
      type: [String, Number],
      default: '0',
    },

    gasPrice: {
      type: [String, Number],
      default: '0',
    },

    gasLimit: {
      type: [String, Number],
      default: '0',
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    isLoading: {
      type: Boolean,
      default: false,
    },

    showFee: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    lastChangedPriceType: 'amount',
    price: 0,
  }),

  computed: {
    currentTokenSymbol() {
      return get(this.currentToken, 'symbol');
    },

    decimal() {
      const { currentToken } = this;

      return get(currentToken, 'decimals') || 18;
    },

    gasFeeBN() {
      return BigNumber(toWei(this.gasPrice, 'gwei')).times(this.gasLimit);
    },

    gasFee() {
      return fromWei(this.gasFeeBN.toFixed());
    },

    maxAmount() {
      const { currentToken, balance, gasFeeBN } = this;

      if (!currentToken) {
        const balanceBN = BigNumber(balance || '0');
        const amountBN = balanceBN.minus(gasFeeBN);
        const amount = fromWei(amountBN.toFixed());

        return amount > 0 ? amount : 0;
      }

      const tokenBalance = get(currentToken, 'balance') || 0;

      if (!tokenBalance) {
        return 0;
      }

      return tokenBalance;
    },

    maxPrice() {
      const {
        currentToken, ethPrice, maxAmount, fiatCurrency,
      } = this;

      if (currentToken) {
        // TODO: change ETH price getting logic
        const tokenPrice = get(currentToken, `price.${fiatCurrency}`) || 0;

        return BigNumber(tokenPrice)
          .times(maxAmount)
          .toFixed(2);
      }

      const maxAmountBn = BigNumber(maxAmount);
      const amount = maxAmountBn
        .times(ethPrice)
        .minus('0.01')
        .toFixed(2);

      return amount > 0 ? amount : 0;
    },
  },

  watch: {
    currentToken() {
      this.resetAmountOptions();
    },

    activeNet(newValue, prevValue) {
      if (newValue.id !== prevValue.id) {
        this.emitChangeTokenInfo(this.tokensCurrencies[0]);
      }
    },

    maxAmount() {
      if (BigNumber(this.value).gt(this.maxAmount)) {
        this.emitInputValue(this.maxAmount);
      }
    },

    value() {
      if (this.lastChangedPriceType === 'amount') {
        this.getPriceFromAmount();
      }
    },

    price() {
      if (this.lastChangedPriceType === 'price') {
        this.getAmountFromPrice();
      }
    },

    balance() {
      this.handleChangeBalanceAndGasFee();
    },

    gasFee() {
      this.handleChangeBalanceAndGasFee();
    },
  },

  methods: {
    resetAmountOptions() {
      this.price = 0;
      this.emitInputValue(0);
    },

    setMaxAmount() {
      if (!this.disabled) {
        this.emitInputValue(this.maxAmount);
      }
    },

    getAmountFromPrice() {
      const {
        price, fiatCurrency, currentToken, ethPrice,
      } = this;

      if (currentToken) {
        const tokenPrice = get(currentToken, `price.${fiatCurrency}`, 0);
        const amount = BigNumber(price)
          .div(tokenPrice)
          .toFixed(parseInt(this.decimal, 10));

        this.emitInputValue(amount);
      } else {
        const amount = BigNumber(price)
          .div(ethPrice)
          .toFixed(parseInt(this.decimal, 10));

        this.emitInputValue(amount);
      }
    },

    getPriceFromAmount() {
      const {
        value, currentToken, ethPrice, fiatCurrency,
      } = this;

      if (currentToken) {
        const tokenPrice = get(currentToken, `price.${fiatCurrency}`) || 0;

        this.price = BigNumber(value)
          .times(tokenPrice)
          .toFixed(2);
      } else {
        this.price = BigNumber(value)
          .times(ethPrice)
          .toFixed(2);
      }
    },

    handleAmountInput(value) {
      this.lastChangedPriceType = 'amount';
      this.emitInputValue(value);
    },

    handlePriceInput(value) {
      this.lastChangedPriceType = 'price';
      this.price = value;
    },

    handleChangeBalanceAndGasFee() {
      const { balance, gasFeeBN } = this;

      if (gasFeeBN.gt(balance)) {
        this.errors.add({
          field: 'value',
          msg: 'Insufficient funds',
          id: 'insufficientBalance',
        });
      } else {
        this.errors.removeById('insufficientBalance');
      }
    },

    emitInputValue(value) {
      this.$emit('input', value);
    },

    emitChangeTokenInfo(value) {
      this.$emit('change-token', value);
    },
  },
};
</script>

<style lang="scss">
.amount-max-button {
  pointer-events: all !important;
  cursor: pointer;
}

.amount-fiat-currency {
  padding: 6px 9px;
}
</style>
