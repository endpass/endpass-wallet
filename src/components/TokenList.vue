<template>
  <div class="tokens-list">
    <ul v-if="selectedTokens && selectedTokens.length">
      <li
        v-for="token in selectedTokens"
        :class="itemClass"
        :key="token.address"
      >
        <v-spinner
          v-if="isLoading"
          :is-loading="isLoading"
          class="spinner"
        />
        <v-token
          v-else
          :token="token"
          :currency="currency"
          :price="prices.get(token.symbol)"
        >
          <a
            v-if="hasRemove"
            slot="right"
            class="is-inline-block remove-token-button"
            title="Remove Token"
            @click="deleteTokenAndUnsubscribe({token})"
          >
            <span
              class="icon has-text-danger is-small is-pulled-right"
              v-html="require('@/img/x.svg')"
            />
          </a>
        </v-token>
      </li>
    </ul>
    <p
      v-else
      class="small"
    >
      You have no tokens at this address.
    </p>
  </div>
</template>

<script>
import { Token } from '@/class/Token';
import VToken from '@/components/VToken';
import VSpinner from '@/components/ui/VSpinner';
import { mapState, mapActions, mapGetters } from 'vuex';
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
    // TODO test that user added tokens have balances
    selectedTokens() {
      if (this.tokens && this.tokens.length) {
        return this.tokens;
      }
      return this.tokensWithBalance;
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
      tokenPrices: state => state.tokens.prices,
      ethPrice: state => state.price.price,
      currency: state => state.user.settings.fiatCurrency,
    }),
    ...mapGetters('tokens', ['tokensWithBalance']),
  },
  methods: {
    ...mapActions('tokens', [
      'updateTokensPrices',
      'deleteTokenAndUnsubscribe',
    ]),
    // Return value of tokens in fiat
    getTokenPrice(symbol) {
      const prices = this.tokenPrices[symbol] || {};
      return new BigNumber(prices.ETH || 0).times(this.ethPrice).toString();
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
  mixins: [error],
  components: {
    VToken,
    VSpinner,
  },
};
</script>

<style lang="scss">
.tokens-list {
  .spinner {
  }
}
</style>
