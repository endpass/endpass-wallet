<template>
  <div
    class="tokens-list"
    data-test="tokens-list"
  >
    <label
      v-if="collapsable && tokens.length > 0"
      class="tokens-list-toggler"
    >
      <input
        v-model="isDustbinTokensVisible"
        type="checkbox"
        data-test="dustbin-toggler"
      >
      <span>Show dust amount tokens</span>
    </label>
    <ul v-if="actualTokens.length > 0">
      <li
        v-for="token in actualTokens"
        :class="itemClass"
        :key="token.address"
        data-test="user-token"
      >
        <v-token
          :token="token"
          :currency="currency"
        >
          <a
            v-if="isTokenCanBeDeleted(token)"
            slot="right"
            class="is-inline-block remove-token-button"
            title="Remove Token"
            data-test="delete-button"
            @click="deleteToken(token)"
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
      v-if="tokens.length === 0"
      class="small"
    >
      You have no tokens at this address.
    </p>
  </div>
</template>

<script>
import get from 'lodash/get';
import { BigNumber } from 'bignumber.js';
import { mapState, mapActions, mapGetters } from 'vuex';
import VToken from '@/components/VToken';
import error from '@/mixins/error';

export default {
  props: {
    tokens: {
      type: Array,
      default: () => [],
    },

    hasRemove: {
      type: Boolean,
      default: false,
    },

    itemClass: {
      type: [Object, Array, String],
      default: '',
    },

    collapsable: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    isDustbinTokensVisible: false,
  }),

  computed: {
    ...mapGetters('tokens', ['currentNetUserFullTokens']),
    ...mapState({
      currency: state => state.user.settings.fiatCurrency,
    }),

    actualTokens() {
      const { collapsable, isDustbinTokensVisible } = this;

      if (!collapsable || isDustbinTokensVisible) {
        return this.tokens;
      }

      return this.tokens.filter(token => this.getTokenAmountBN(token).gt('0.01'));
    },
  },

  methods: {
    ...mapActions('tokens', ['removeUserToken']),

    getTokenAmountBN(token) {
      const tokenPrice = get(token, `price.${this.currency}`, 0);
      const tokenBalance = get(token, 'balance', 0);

      return BigNumber(tokenBalance).times(tokenPrice);
    },

    isTokenCanBeDeleted(token) {
      const { hasRemove, currentNetUserFullTokens } = this;

      return (
        hasRemove
        && currentNetUserFullTokens[token.address]
        && get(token, 'balance', '0') === '0'
      );
    },

    async deleteToken(token) {
      await this.removeUserToken({
        token,
      });
    },

    toggleDustbinTokens() {
      this.isDustbinTokensVisible = !this.isDustbinTokensVisible;
    },
  },

  mixins: [error],

  components: {
    VToken,
  },
};
</script>

<style lang="scss">
.tokens-list-toggler {
  display: block;
  margin-bottom: 20px;

  &:only-child {
    margin-bottom: 0;
  }

  & > input[type='checkbox'] {
    display: inline-block;
    vertical-align: middle;
  }

  & > span {
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
  }
}
</style>
