<template>
	<div class="balance">
    <span class="title amount" :title="balanceString"
      :class="{'long-number': balance.length > 6}">{{ balanceStringShort }}</span>
    <span class="currency">
      {{currency}}
    </span>
    <a v-if="hasUpdate" @click.prevent="update()">
    	<span class="icon is-small"
                v-html="require('@/img/reload.svg')"></span>
    </a>
	</div>
</template>
<script>
import { BigNumber } from 'bignumber.js';
export default {
  props: {
    amount: {
      default: 0,
    },
    price: {
      default: 1,
    },
    currency: {
      type: String,
      default: 'ETH',
    },
    decimals: {
      default: 18,
    },
    round: {
      default: 4,
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

      let balance = amountBn.times(priceBn);
      return balance;
    },
    balanceString() {
      let balanceString = this.balance
        .toFixed(this.decimals)
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
};
</script>

<style lang="scss">
.balance {
  line-height: 2.2rem;
  .amount {
    color: inherit;
    display: inline-block;
    margin: 0;
    font-size: 2rem;
    vertical-align: bottom;
  }

  .currency {
    display: inline-block;
    text-transform: uppercase;
    font-weight: 700;
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
