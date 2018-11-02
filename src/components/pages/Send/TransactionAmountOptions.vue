<template>
  <div
    class="send-amount field is-horizontal"
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
        id="value"
        :value="value"
        :validator="`required|decimal:${decimal}|between:0,${maxAmount}`"
        :disabled="isLoading || disabled"
        type="number"
        data-vv-as="amount"
        min="0"
        step="any"
        name="value"
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
        id="price"
        :value="price"
        :validator="`required|decimal:2|between:0,${maxPrice}`"
        :disabled="!ethPrice || disabled"
        type="number"
        min="0"
        step="0.01"
        name="price"
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
</template>

<script>
import { get } from 'lodash';
import { BigNumber } from 'bignumber.js';
import web3 from '@/utils/web3';
import VInput from '@/components/ui/form/VInput';
import VSelect from '@/components/ui/form/VSelect';

export default {
  name: 'TransactionAmountOptions',

  props: {
    value: {
      type: [String, Number],
      required: true,
    },

    ethPrice: {
      type: Number,
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
      type: String,
      default: '0',
    },

    estimatedGasCost: {
      type: [String, Number],
      default: 0,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    isLoading: {
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

    maxAmount() {
      const { currentToken, balance, estimatedGasCost } = this;
      const tokenBalance = get(currentToken, 'balance') || 0;

      if (!currentToken) {
        const { fromWei } = web3.utils;
        const balanceBN = BigNumber(balance || '0');
        const estimatedGasCostBN = BigNumber(estimatedGasCost || '0');
        const amountBN = balanceBN.minus(estimatedGasCostBN);
        const amount = fromWei(amountBN.toFixed());

        return amount > 0 ? amount : 0;
      }

      if (!tokenBalance) {
        return 0;
      }

      const balanceBn = BigNumber(tokenBalance);
      const decimalsBn = BigNumber(10).pow(this.decimal);

      return balanceBn.div(decimalsBn).toString(10);
    },

    maxPrice() {
      const { currentToken, ethPrice, maxAmount } = this;

      if (currentToken) {
        // TODO: change ETH price getting logic
        const tokenPrice = get(currentToken, 'price.ETH') || 0;

        return BigNumber(tokenPrice * maxAmount)
          .times(ethPrice)
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
      this.handleChangeBalanceAndEstimatedGasCost();
    },

    estimatedGasCost() {
      this.handleChangeBalanceAndEstimatedGasCost();
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
      const { price, currentToken, ethPrice } = this;
      let amount = null;

      if (currentToken) {
        const tokenPrice = get(currentToken, 'price.ETH') || 0;

        amount = BigNumber(price)
          .div(ethPrice)
          .div(tokenPrice)
          .toFixed(parseInt(this.decimal, 10));
      } else {
        amount = BigNumber(price)
          .div(ethPrice)
          .toFixed(parseInt(this.decimal, 10));
      }

      this.emitInputValue(amount);
    },

    getPriceFromAmount() {
      const { value, currentToken, ethPrice } = this;

      if (currentToken) {
        const tokenPrice = get(currentToken, 'price.ETH') || 0;

        this.price = BigNumber(value * tokenPrice)
          .times(ethPrice)
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

    handleChangeBalanceAndEstimatedGasCost() {
      const { balance, estimatedGasCost } = this;

      if (BigNumber(estimatedGasCost).gt(balance)) {
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

  components: {
    VInput,
    VSelect,
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
