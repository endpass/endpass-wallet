// Methods for dealing with web3 network providers
export default {
  computed: {
    networks() {
      return this.$store.getters['web3/networks'];
    },
    activeNet() {
      return this.$store.state.web3.activeNet;
    },
    isMainNet() {
      return this.activeNet.id === 1;
    },
  }
}
