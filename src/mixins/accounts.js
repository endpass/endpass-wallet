// Mixin for common methods for Ethereum accounts
import { fromWei } from 'web3-utils';

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
