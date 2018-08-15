<template>
  <ul class="tokens-list">
    <li v-for="token in tokens" :key="token.address">
      <v-spinner v-if="isLoading"
        :is-loading="isLoading"
        class="spinner"
        />
      <v-token v-else
        :token="token"
        :currency="currency"
        :price="tokenPrices[token.symbol]"
      />
    </li>
  </ul>
</template>

<script>
import { Token } from '@/class/Token';
import VToken from '@/components/VToken';
import VSpinner from '@/components/ui/VSpinner';
import { mapState, mapGetters, mapActions } from 'vuex';
import { BigNumber } from 'bignumber.js';
import error from '@/mixins/error';

// List of the user's active tokens
export default {
  data() {
    return {
      isLoading: true,
      tokenPrices: {},
    };
  },
  computed: {
    tokens() {
      return this.activeTokens.map(token => {
        return new Token(token);
      });
    },
    ...mapState({
      activeTokens: state => state.tokens.activeTokens,
      ethPrice: state => state.price.price,
      currency: state => state.accounts.settings.fiatCurrency,
    }),
    ...mapGetters('tokens', ['tokenEthPrice']),
  },
  methods: {
    ...mapActions('tokens', ['updateTokenPrice']),
    // Return value of tokens in fiat
    getTokenPrice(symbol) {
      return new BigNumber(this.tokenEthPrice(symbol))
        .times(this.ethPrice)
        .toString();
    },
    // Get token prices for all tokens
    updateTokenPrices() {
      // Promises to get prices of all tokens
      return Promise.all(
        this.tokens.map(token => this.updateTokenPrice(token.symbol)),
      )
        .then(() => {
          this.tokenPrices = this.tokens.map(token =>
            this.getTokenPrice(token.symbol),
          );
          this.isLoading = false;
        })
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
