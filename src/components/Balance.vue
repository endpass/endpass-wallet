<template>
	<div class="balance has-spinner">
    <span class="title amount" :title="balanceString"
      :class="{'long-number': balance.length > 6}">{{ balanceStringShort }}</span>
    <span class="currency">
      {{currency}}
    </span>
    <a class="button is-small" :class="{'is-loading': isLoading}" v-if="hasUpdate" @click.prevent="update()">
    	<span class="icon is-small"
                v-html="require('@/img/reload.svg')"></span>
    </a>
    <v-spinner class="is-transparent" :is-loading="isLoading"></v-spinner>
	</div>
</template>
<script>
import { BigNumber } from 'bignumber.js';
import VSpinner from '@/components/ui/VSpinner';

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
