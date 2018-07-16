<template>
	<div>
    <p class="heading">Balance</p>
    <span class="title" :class="{'long-number': balance.length > 6}">{{ balance }}</span>
    {{currency}}
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
      let balanceString = balance
        .toFixed(this.decimals)
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
<style>
</style>
