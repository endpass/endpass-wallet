<template>
  <div
    class="tokens-list"
    data-test="tokens-list"
  >
    <ul v-if="tokens.length > 0">
      <li
        v-for="token in tokens"
        :class="itemClass"
        :key="token.address"
        data-test="user-token"
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
            data-test="delete-button"
            @click="removeUserToken({token})"
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
import VToken from '@/components/VToken';
import VSpinner from '@/components/ui/VSpinner';
import { mapState, mapActions } from 'vuex';
import { BigNumber } from 'bignumber.js';
import error from '@/mixins/error';

export default {
  props: {
    tokens: {
      type: Array,
      default: () => [],
      required: false,
    },

    hasRemove: {
      type: Boolean,
      default: false,
    },

    itemClass: {
      type: [Object, Array, String],
      default: '',
      required: false,
    },
  },

  data: () => ({
    isLoading: true,
  }),

  computed: {
    ...mapState({
      tokenPrices: state => state.tokens.prices,
      ethPrice: state => state.price.price,
      currency: state => state.user.settings.fiatCurrency,
    }),

    prices() {
      return new Map(
        this.tokens.map(token => [
          token.symbol,
          this.getTokenPrice(token.symbol),
        ]),
      );
    },
  },

  methods: {
    ...mapActions('tokens', ['getTokensPrices', 'removeUserToken']),

    /**
     * Returns value of tokens in fiat
     * @param {String} symbol Token symbol
     * @returns {String} Token price in fiat
     */
    getTokenPrice(symbol) {
      const prices = this.tokenPrices[symbol] || {};

      return new BigNumber(prices.ETH || 0).times(this.ethPrice).toString();
    },
  },

  async mounted() {
    if (this.tokens.length > 0) {
      /**
       * It needs because list can contain custom tokens list which not belongs to current
       * user tokens
       */
      await this.getTokensPrices(this.tokens.map(({ symbol }) => symbol));
    }

    this.isLoading = false;
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
