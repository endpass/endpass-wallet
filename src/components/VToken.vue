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
        :amount="token.balance"
        :currency="token.symbol"
        :decimals="token.decimals"
        :round="4"
        class="is-inline-block"
      />
      <balance
        v-if="token.price"
        :amount="token.balance"
        :currency="currency"
        :decimals="2"
        :round="2"
        :price="tokenPrice"
        class="is-inline-block"
      />
      <slot name="right" />
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import Balance from '@/components/Balance';

// Displays details about a single ERC20 token
export default {
  name: 'VToken',

  props: {
    token: {
      type: Object,
      required: true,
    },

    currency: {
      type: String,
      default: 'USD',
    },
  },

  computed: {
    tokenPrice() {
      return get(this.token.price, this.currency, 0);
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
