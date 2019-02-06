<template>
  <div class="menu">
    <ul class="menu-list">
      <li>
        <a :class="{ 'is-active': isActive }" @click="handleClick">
          <account :key="address" :address="address" :size="10">
            <template slot="balance">
              <div v-if="isLoading" class="column has-spinner">
                <v-spinner :is-loading="isLoading" class="is-transparent" />
              </div>
              <balance
                v-else
                :amount="balance"
                :currency="activeCurrency.name"
                @update="getBalance"
              />
            </template>
          </account>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import Account from '@/components/Account';
import Balance from '@/components/Balance';

export default {
  name: 'WalletItem',
  props: {
    address: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    isLoading: true,
    balance: null,
  }),
  computed: {
    ...mapState('web3', ['activeCurrency']),
    ...mapGetters('web3', ['activeNetwork']),
  },
  watch: {
    activeNetwork() {
      this.getBalance();
    },
  },
  methods: {
    ...mapActions('accounts', ['getBalanceByAddress']),

    async getBalance() {
      this.isLoading = true;

      try {
        const { address } = this;
        const res = await this.getBalanceByAddress(address);

        this.balance = res.balance;
      } catch (e) {
        this.balance = '0';
      } finally {
        this.isLoading = false;
      }
    },
    handleClick() {
      this.$emit('click', this.address);
    },
  },
  mounted() {
    this.getBalance();
  },
  components: {
    Account,
    Balance,
  },
};
</script>
