<template>
  <div class="card app-card">
    <div class="card-header">
      <h2 class="card-header-title">Receive ETH</h2>
    </div>
    <div
      class="card-content"
      data-test="current-account"
    >
      <div
        v-if="isCurrentAccount"
        class="card-section"
      >
        Your Active Address:
      </div>
      <div class="card-section">
        <account
          v-if="address"
          :currency="activeCurrencyName"
          :address="address"
          :balance="balance"
        />
      </div>
      <div
        v-if="allowSend"
        class="card-section"
      >
        <v-button
          type="button"
          name="button"
          data-test="send-button"
          @click="emitSend"
        >
          Send ethereum
        </v-button>
      </div>
      <div class="card-tokens">
        <tokens-list :tokens="currentTokens" />
        <v-spinner
          v-if="isLoading"
          :is-loading="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Account from '@/components/Account';
import TokensList from '@/components/TokensList';
import VSpinner from '@/components/ui/VSpinner';
import VButton from '@/components/ui/form/VButton';

export default {
  name: 'ReceiveAccountCard',

  props: {
    isCurrentAccount: {
      type: Boolean,
      required: false,
      default: false,
    },

    address: {
      type: String,
      required: true,
    },

    activeCurrencyName: {
      type: String,
      required: true,
    },

    balance: {
      type: String,
      required: false,
      default: '0',
    },

    allowSend: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    tokens: [],
    isLoading: false,
  }),

  computed: {
    ...mapGetters('tokens', ['trackedTokensWithBalance']),

    currentTokens() {
      if (this.isCurrentAccount) {
        return this.trackedTokensWithBalance;
      }

      // return this.$store.getters['tokens/trackedTokensWithBalanceByAddress'](this.address);

      return [];
    },
  },

  watch: {
    address: {
      async handler() {
        if (!this.isCurrentAccount) {
          await this.loadTokens();
        }
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions('tokens', ['getTokensFullDataByAddress']),

    async loadTokens() {
      this.isLoading = true;

      await this.getTokensFullDataByAddress({
        address: this.address,
      });

      this.isLoading = false;
    },

    emitSend() {
      this.$emit('send');
    },
  },

  components: {
    Account,
    TokensList,
    VSpinner,
    VButton,
  },
};
</script>

<style lang="scss" scoped>
.card-section {
  margin-bottom: 1rem;
}

.card-tokens {
  position: relative;
}
</style>
