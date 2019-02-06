<template>
  <div class="card app-card">
    <div class="card-header">
      <h2 class="card-header-title">Receive ETH</h2>
    </div>
    <div class="card-content" data-test="current-account">
      <div v-if="isCurrentAccount" class="card-section">
        Your Active Address:
      </div>
      <div class="card-section">
        <account
          v-if="address"
          :currency="activeCurrencyName"
          :address="address"
          :balance="accountBalance"
        />
      </div>
      <div v-if="allowSend" class="card-section">
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
        <tokens-list v-if="!isLoading" :tokens="accountTokensList" />
      </div>
    </div>
  </div>
</template>

<script>
import Bignumber from 'bignumber.js';
import { fromWei } from 'web3-utils';
import { get, uniqBy, toString } from 'lodash';
import { mapActions, mapGetters } from 'vuex';
import Account from '@/components/Account';
import TokensList from '@/components/TokensList';

export default {
  name: 'AccountWalletCard',

  props: {
    activeNetId: {
      type: Number,
      required: true,
    },

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

    allowSend: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    localBalanceData: {},
    isLoading: false,
  }),

  computed: {
    ...mapGetters('accounts', ['balance']),
    ...mapGetters('tokens', ['allCurrentAccountFullTokens']),

    accountTokensList() {
      const tokens = this.isCurrentAccount
        ? Object.values(this.allCurrentAccountFullTokens)
        : this.localBalanceData.tokens;

      return uniqBy(tokens, 'address');
    },

    accountBalance() {
      if (this.isCurrentAccount) {
        const stringifiedBalance = toString(this.balance);

        return Bignumber(stringifiedBalance).toFixed(4);
      }

      const balance = get(this.localBalanceData, 'balance', '0');
      const stringifiedBalance = toString(balance);
      const normalizedBalance = fromWei(stringifiedBalance);

      return Bignumber(normalizedBalance).toFixed(4);
    },
  },

  watch: {
    async activeNetId(newValue, prevValue) {
      if (newValue !== prevValue) {
        await this.loadBalanceData();
      }
    },
  },

  methods: {
    ...mapActions('accounts', ['getBalanceByAddress']),

    async loadBalanceData() {
      this.isLoading = true;

      const { address } = this;
      const { balance, tokens } = await this.getBalanceByAddress(address);

      this.localBalanceData = {
        balance,
        tokens,
      };

      this.isLoading = false;
    },

    emitSend() {
      this.$emit('send');
    },
  },

  created() {
    if (!this.isCurrentAccount) {
      this.loadBalanceData();
    }
  },

  components: {
    Account,
    TokensList,
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
