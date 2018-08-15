<template>
  <div class="media token">
    <div class="media-left">
      <p class="image token-logo is-32x32">
        <img :src="token.logo">
      </p>
    </div>
    <div class="media-content">
      <div class="content">
        <p class="token-title">
          <span class="token-symbol">{{ token.symbol }}</span>
          <span class="token-name">{{ token.name }}</span>
        </p>
        <slot></slot>
      </div>
    </div>
    <div class="media-right">
      <balance
        v-if="token.balance && token.balance.length"
        class="is-inline-block"
        :amount="amount"
        :decimals="token.decimals"
      />

      <balance
        v-if="price"
        class="is-inline-block"
        :amount="amount"
        :currency="currency"
        :decimals="2"
        :price="price"
      />
    </div>
  </div>
</template>

<script>
import { Token } from '@/class/Token';
import Balance from '@/components/Balance';
import { BigNumber } from 'bignumber.js';

// Displays details about a single ERC20 token
export default {
  name: 'v-token',
  props: {
    token: {
      type: Token,
      required: true,
    },
    //fiat currency
    currency: {
      type: String,
      default: 'USD',
    },
    price: {
      default: 0,
    },
  },
  computed: {
    // Return token balance in wei
    amount() {
      let balanceBn = new BigNumber(this.token.balance);
      let decimalsBn = new BigNumber(10).pow(this.token.decimals);
      return balanceBn.div(decimalsBn);
    },
  },
  components: {
    Balance,
  },
};
</script>

<style lang="scss">
.token {
  .token-title {
    .token-symbol {
      font-weight: 600;
    }
    .token-name {
    }
  }
  .balance {
  }
}
</style>
