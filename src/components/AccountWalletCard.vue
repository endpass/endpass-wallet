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
        <v-spinner v-if="isLoading" />
        <tokens-list
          v-if="!isLoading"
          :tokens="accountTokensList"
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
  name: 'AccountWalletCard',

  props: {
    isCurrentAccount: {
      type: Boolean,
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
      default: '0',
    },

    allowSend: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    isLoading: false,
  }),

  computed: {
    ...mapGetters('tokens', ['fullTokensByAddress']),

    accountTokens() {
      return this.fullTokensByAddress(this.address);
    },

    accountTokensList() {
      return Object.values(this.accountTokens);
    },
  },

  methods: {
    ...mapActions('tokens', [
      'getTokensByAddress',
      'getTokensBalancesByAddress',
    ]),

    async loadTokensData() {
      const {
        address,
        accountTokens,
        getTokensByAddress,
        getTokensBalancesByAddress,
      } = this;

      this.isLoading = true;

      if (Object.keys(accountTokens).length === 0) {
        await getTokensByAddress({ address });
      }

      await getTokensBalancesByAddress({
        address,
      });

      this.isLoading = false;
    },

    emitSend() {
      this.$emit('send');
    },
  },

  created() {
    this.loadTokensData();
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
