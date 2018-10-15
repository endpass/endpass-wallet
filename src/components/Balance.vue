<template>
  <div class="balance has-spinner">
    <span
      :title="balanceString"
      :class="{'long-number': balance.length > 6}"
      class="title amount"
    >
      {{ balanceStringShort }}
    </span>
    <span class="currency">
      {{ currency }}
    </span>
    <a
      v-if="hasUpdate"
      :class="{'is-loading': isLoading}"
      class="button is-small"
      @click.prevent="update()"
    >
      <span
        class="icon is-small"
        v-html="require('@/img/reload.svg')"
      />
    </a>
    <v-spinner
      v-if="isLoading"
      class="is-transparent"
    />
  </div>
</template>
<script>
import { BigNumber } from 'bignumber.js';
import VSpinner from '@/components/ui/VSpinner';

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
    balance() {
      let amountBn;
      if (!BigNumber.isBigNumber(this.amount)) {
        amountBn = new BigNumber(this.amount);
      } else {
        amountBn = this.amount;
      }
      let priceBn;
      if (!BigNumber.isBigNumber(this.price)) {
        priceBn = new BigNumber(this.price);
      } else {
        priceBn = this.price;
      }

      const balance = amountBn.times(priceBn);

      return balance;
    },
    balanceString() {
      let balanceString = this.balance
        .toFixed(parseInt(this.decimals, 10))
        .match(/^[0-9]{1,18}(\.[0-9]{0,18}[^0]{1,18}){0,1}/);
      balanceString = balanceString ? balanceString[0] : '0';
      return balanceString;
    },
    balanceStringShort() {
      let balanceString = this.balance
        .toFixed(this.round)
        .match(/^[0-9]{1,18}(\.[0-9]{0,18}[^0]{1,18}){0,1}/);
      balanceString = balanceString ? balanceString[0] : '0';
      return balanceString;
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
  components: {
    VSpinner,
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
</style>
