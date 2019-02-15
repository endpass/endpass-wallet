<template>
  <div class="tokens-list" data-test="tokens-list">
    <ul v-if="tokens.length > 0">
      <li
        v-for="token in tokens"
        :class="itemClass"
        :key="token.address"
        data-test="user-token"
      >
        <v-token :token="token" :currency="currency">
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
    <p v-else class="small">
      You have no tokens at this address.
    </p>
  </div>
</template>

<script>
import get from 'lodash/get';
import VToken from '@/components/VToken';
import { mapState, mapActions, mapGetters } from 'vuex';
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
  },

  computed: {
    ...mapGetters('tokens', ['currentNetUserFullTokens']),
    ...mapState({
      currency: state => state.user.settings.fiatCurrency,
      userTokens: state => state.tokens.userTokens,
    }),
  },

  methods: {
    ...mapActions('tokens', ['removeUserToken']),

    isTokenCanBeDeleted(token) {
      const { hasRemove, currentNetUserFullTokens } = this;

      return (
        hasRemove &&
        currentNetUserFullTokens[token.address] &&
        get(token, 'balance', '0') === '0'
      );
    },

    async deleteToken(token) {
      await this.removeUserToken({
        token,
      });
    },
  },

  mixins: [error],

  components: {
    VToken,
  },
};
</script>

<style lang="scss"></style>
