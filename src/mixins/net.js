// Methods for dealing with web3 network providers
export default {
  computed: {
    networks() {
      return this.$store.getters['web3/networks'];
    },
    activeNet() {
      return this.$store.state.web3.activeNet;
    },
    networkType() {
      return this.activeNet.networkType;
    },
    networkClass() {
      return {
        mainnet: this.networkType === 'main',
        privatenet: this.networkType === 'private',
        testnet: this.networkType !== 'main' && this.networkType !== 'private',
      };
    },
  },
};
