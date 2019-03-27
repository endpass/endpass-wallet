<template>
  <div class="balance has-spinner">
    <div
      v-if="isLoading"
      class="balance-spinner"
    >
      <v-spinner class="is-transparent" />
    </div>
    <template v-else>
      <span
        :title="balanceString"
        :class="{ 'long-number': balanceString.length > 6 }"
        data-test="balance-value"
        class="title amount"
      >
        {{ balanceStringShort }}
      </span>
      <span class="currency">
        {{ currency }}
      </span>
    </template>
    <a
      v-if="hasUpdate"
      :class="{ 'is-loading': isLoading }"
      class="button is-small"
      @click.prevent="update()"
    >
      <span
        class="icon is-small"
        v-html="require('@/img/reload.svg')"
      />
    </a>
  </div>
</template>
<script>
import get from 'lodash/get';
import { BigNumber } from 'bignumber.js';

export default {
  name: 'Balance',
  props: {
    amount: {
      type: [Number, String],
      default: 0,
    },
    price: {
      type: [Number, String],
      default: 1,
    },
    currency: {
      type: String,
      default: 'ETH',
    },
    decimals: {
      type: [Number, String],
      default: 18,
    },
    round: {
      type: [Number, String],
      default: 4,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    balanceBN() {
      const { price, amount } = this;
      return BigNumber(amount).times(price);
    },
    balanceString() {
      const balanceString = this.balanceBN
        .toFixed(parseInt(this.decimals, 10))
        .match(/^[0-9]{1,18}(\.[0-9]{0,18}[^0]{1,18}){0,1}/);
      return get(balanceString, '[0]', '0');
    },
    balanceStringShort() {
      const balanceString = this.balanceBN
        .toFixed(this.round)
        .match(/^[0-9]{1,18}(\.[0-9]{0,18}[^0]{1,18}){0,1}/);
      return get(balanceString, '[0]', '0');
    },
    hasUpdate() {
      return this.$listeners.update;
    },
  },
  methods: {
    update() {
      this.$emit('update');
    },
  },
};
</script>

<style lang="scss">
.balance {
  line-height: 2.2rem;
  .amount {
    color: inherit;
    display: inline-block;
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    vertical-align: bottom;
  }
  .currency {
    display: inline-block;
    text-transform: uppercase;
    vertical-align: bottom;
    line-height: 1.4;
  }
  &.is-small {
    line-height: 1.5rem;
    .amount {
      font-size: 1.2rem;
      font-weight: 700;
    }
    .currency {
      font-size: 0.8rem;
    }
  }
}
.balance-spinner {
  position: relative;
  display: inline-block;
  vertical-align: bottom;
  width: 2.2rem;
  height: 2.2rem;
}
</style>
