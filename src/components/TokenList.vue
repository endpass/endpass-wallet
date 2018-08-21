<template>
  <ul class="tokens-list">
    <li v-for="token in selectedTokens" :class="itemClass" :key="token.address">
      <v-spinner v-if="isLoading"
        :is-loading="isLoading"
        class="spinner"
        />
      <v-token v-else
        :token="token"
        :currency="currency"
        :price="prices.get(token.symbol)"
      >
        <a
          slot="right"
          v-if="hasRemove"
          class="is-inline-block remove-token-button"
          title="Remove Token"
          @click="deleteTokenAndUnsubscribe({token})"
          >
            <span
              class="icon has-text-danger is-small is-pulled-right"
              v-html="require('@/img/x.svg')"
            ></span>
        </a>
      </v-token>
    </li>
  </ul>
</template>

<script>
import { Token } from '@/class/Token';
import VToken from '@/components/VToken';
import VSpinner from '@/components/ui/VSpinner';
import { mapState, mapActions } from 'vuex';
import { BigNumber } from 'bignumber.js';
import error from '@/mixins/error';

// List of the user's active tokens
export default {
  props: {
    tokens: {
      type: Array,
      default: null,
    },
    // Show remove token button
    hasRemove: {
      type: Boolean,
      default: false,
    },
    // Classes to set on token
    itemClass: {
      type: [Object, Array, String],
    },
  },
  data() {
    return {
      isLoading: true,
    };
  },
  computed: {
    selectedTokens() {
      let trackedTokens = this.tokens ? this.tokens : this.trackedTokens;
      return trackedTokens.map(token => {
        return new Token(token);
      });
    },
    // Returns a Map of token symbol to price
    prices() {
      return new Map(
        this.selectedTokens.map(token => [
          token.symbol,
          this.getTokenPrice(token.symbol),
        ]),
      );
    },
    ...mapState({
      trackedTokens: state => state.tokens.trackedTokens,
      tokenPrices: state => state.tokens.prices,
      ethPrice: state => state.price.price,
      currency: state => state.accounts.settings.fiatCurrency,
    }),
  },
  methods: {
    ...mapActions('tokens', [
      'updateTokensPrices',
      'deleteTokenAndUnsubscribe',
    ]),
    // Return value of tokens in fiat
    getTokenPrice(symbol) {
      return new BigNumber(this.tokenPrices[symbol] || 0)
        .times(this.ethPrice)
        .toString();
    },
    // Get token prices for all tokens
    async updateTokenPrice() {
      await this.updateTokensPrices();
      this.isLoading = false;
    },
  },
  mounted() {
    this.updateTokenPrice();
  },
  components: {
    VToken,
    VSpinner,
  },
  mixins: [error],
};
</script>

<style lang="scss">
.tokens-list {
  .spinner {
  }
}
</style>
