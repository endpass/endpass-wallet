<template>
  <ul class="tokens-list">
    <li v-for="token in selectedTokens" :key="token.address">
      <v-spinner v-if="isLoading"
        :is-loading="isLoading"
        class="spinner"
        />
      <v-token v-else
        :token="token"
        :currency="currency"
        :price="prices.get(token.symbol)"
      />
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
  },
  data() {
    return {
      isLoading: true,
    };
  },
  computed: {
    selectedTokens() {
      let activeTokens = this.tokens ? this.tokens : this.activeTokens;
      return activeTokens.map(token => {
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
      activeTokens: state => state.tokens.activeTokens,
      tokenPrices: state => state.tokens.prices,
      ethPrice: state => state.price.price,
      currency: state => state.accounts.settings.fiatCurrency,
    }),
  },
  methods: {
    ...mapActions('tokens', ['updateTokenPrice']),
    // Return value of tokens in fiat
    getTokenPrice(symbol) {
      return new BigNumber(this.tokenPrices[symbol] || 0)
        .times(this.ethPrice)
        .toString();
    },
    // Get token prices for all tokens
    updateTokenPrices() {
      // Promises to get prices of all tokens
      return Promise.all(
        this.activeTokens.map(token => this.updateTokenPrice(token.symbol)),
      )
        .then(() => (this.isLoading = false))
        .catch(e => this.emitError(e));
    },
  },
  mounted() {
    this.updateTokenPrices();
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
