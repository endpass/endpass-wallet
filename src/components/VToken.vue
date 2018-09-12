<template>
  <div class="media token">
    <div class="media-left">
      <p class="image token-logo is-32x32">
        <img
          v-if="token.logo"
          :src="token.logo"
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
        <p class="token-title">
          <span class="token-name">{{ token.name }}</span>
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
import { Token } from '@/class/Token';
import Balance from '@/components/Balance';
import { BigNumber } from 'bignumber.js';

// Displays details about a single ERC20 token
export default {
  name: 'VToken',
  props: {
    token: {
      type: Token,
      required: true,
    },
    // fiat currency
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
      let balanceBn;
      if (this.token.balance instanceof BigNumber) {
        balanceBn = this.token.balance;
      } else {
        balanceBn = new BigNumber(this.token.balance);
      }
      const decimalsBn = new BigNumber(10).pow(this.token.decimals);
      return balanceBn.div(decimalsBn).toString(10);
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
    .token-name {
    }
  }
  .balance {
  }
}
</style>
