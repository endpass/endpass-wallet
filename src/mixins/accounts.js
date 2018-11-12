// Mixin for common methods for Ethereum accounts
import web3 from 'web3';

const { fromWei } = web3.utils;

export default {
  computed: {
    activeAccount() {
      return this.$store.state.accounts.activeAccount;
    },
    address() {
      return this.activeAccount.getChecksumAddressString();
    },
    balance() {
      return this.$store.state.accounts.balance === null
        ? null
        : fromWei(this.$store.getters['accounts/balance']);
    },
  },
};
