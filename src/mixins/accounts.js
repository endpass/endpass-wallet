// Mixin for common methods for Ethereum accounts

export default {
  computed: {
    activeAccount() {
      return this.$store.state.accounts.activeAccount;
    },
    address() {
      return this.activeAccount.getAddressString();
    },
    balance() {
      return this.$store.state.accounts.balance === null ? null : web3.utils.fromWei(this.$store.state.accounts.balance);
    }
  }
}
