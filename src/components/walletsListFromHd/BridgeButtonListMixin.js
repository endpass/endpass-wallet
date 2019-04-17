import WalletAddButton from './WalletAddButton.vue';
import WalletsList from './WalletsList.vue';

export default {
  data() {
    return {
      bridgeButtonListIsLoading: false,
      bridgeButtonListIsImporting: false,
      bridgeButtonListSelectedAddress: null,
    };
  },
  methods: {
    /**
     * @param {string} address
     * @param {number} index
     */
    setSelectedAddress({ address, index }) {
      this.bridgeButtonListSelectedAddress = {
        index,
        address,
      };
    },
  },
  components: {
    WalletAddButton,
    WalletsList,
  },
};
