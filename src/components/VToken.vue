<template>
  <div
    class="media token"
    data-test="token-item"
  >
    <div class="media-left">
      <p class="image token-logo is-32x32">
        <img
          v-if="icon"
          :src="icon"
          :alt="token.name"
        >
        <span
          v-else
          :alt="token.name"
          class="icon missing"
          v-html="require('@/img/compass.svg')"
        />
      </p>
    </div>
    <div class="media-content">
      <div class="content">
        <p
          class="token-title"
          data-test="token-name"
        >
          {{ token.name }}
        </p>
        <slot />
      </div>
    </div>
    <div class="media-right">
      <span
        v-if="!token.balance"
        class="token-symbol"
      >
        {{ token.symbol }}
      </span>
      <balance
        v-if="token.balance"
        :amount="amount"
        :currency="token.symbol"
        :decimals="token.decimals"
        :round="4"
        class="is-inline-block"
      />

      <balance
        v-if="price"
        :amount="amount"
        :currency="currency"
        :decimals="2"
        :round="2"
        :price="price"
        class="is-inline-block"
      />
      <slot name="right" />
    </div>
  </div>
</template>

<script>
import Balance from '@/components/Balance';
import { BigNumber } from 'bignumber.js';

// Displays details about a single ERC20 token
export default {
  name: 'VToken',

  props: {
    token: {
      type: Object,
      required: true,
    },

    // fiat currency
    currency: {
      type: String,
      default: 'USD',
    },

    price: {
      type: String,
      default: '0',
    },
  },

  computed: {
    // Return token balance in wei
    amount() {
      let balanceBn;

      if (this.token.balance instanceof BigNumber) {
        balanceBn = this.token.balance;
      } else {
        balanceBn = new BigNumber(this.token.balance);
      }
      const decimalsBn = new BigNumber(10).pow(this.token.decimals);

      return balanceBn.div(decimalsBn).toString(10);
    },

    icon() {
      return this.token.logo || this.token.image;
    },
  },

  components: {
    Balance,
  },
};
</script>

<style lang="scss">
.token {
  .token-logo {
    .missing {
      opacity: 0.6;
    }
  }
  .token-title {
    .token-symbol {
      font-weight: 600;
    }
  }
  .balance {
  }
}
</style>
