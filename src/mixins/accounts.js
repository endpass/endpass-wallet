// Mixin for common methods for Ethereum accounts
import web3 from 'web3';

const { fromWei } = web3.utils;

export default {
  computed: {
    address() {
      return this.$store.state.accounts.address;
    },

    balance() {
      return this.$store.state.accounts.balance === null
        ? null
        : fromWei(this.$store.getters['accounts/balance']);
    },
  },
};
