<template>
  <div class="column">
    <div
      v-if="!isGettingAddresses && isEmptyAddresses"
      class="buttons"
    >
      <v-button
        :loading="isImporting"
        class-name="is-primary is-medium"
        @click="getNextAddressess"
      >
        {{ $t('components.walletsList.loadWallets') }}
      </v-button>
    </div>
    <v-spinner
      v-if="isGettingAddresses"
      :is-loading="true"
      label="Please, allow access for import"
      is-label-under-spinner
    />
    <div v-show="!isGettingAddresses && !isEmptyAddresses">
      <wallet-item
        v-for="(address, index) in addresses"
        :key="address"
        :address="address"
        :is-used="isUsedWallet(address)"
        :is-active="address === selectedAddress"
        @click="updateSelectedAddress(address, index)"
      />
      <v-pagination
        :offset="offset"
        :limit="limit"
        @offset="changeOffset"
      />
      <slot name="buttons" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import WalletItem from './WalletItem.vue';

export default {
  name: 'WalletsList',
  props: {
    type: {
      type: String,
      required: true,
    },
    autoLoad: {
      type: Boolean,
      default: false,
    },
    isImporting: {
      type: Boolean,
      default: false,
    },
    isGettingAddresses: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    offset: 0,
    limit: 10,
    addresses: [],
    selectedAddress: null,
  }),
  computed: {
    isEmptyAddresses() {
      return this.addresses.length === 0;
    },
    ...mapState('accounts', ['wallets']),
  },
  methods: {
    ...mapActions('accounts', ['getNextWalletsFromHd']),

    async getNextAddressess({ offset = this.offset, limit = this.limit } = {}) {
      this.$emit('input', true);
      const { type: walletType } = this;
      try {
        this.addresses = await this.getNextWalletsFromHd({
          offset,
          limit,
          walletType,
        });
      } catch (error) {
        this.$notify(error);
      } finally {
        this.$emit('input', false);
      }
    },

    async changeOffset(newOffset) {
      this.offset = newOffset;
      await this.getNextAddressess();
    },

    /**
     * @param {string} address
     * @param {number} index
     */
    updateSelectedAddress(address, index) {
      this.selectedAddress = address;
      this.$emit('select', { address, index: index + this.offset });
    },

    /**
     * @param {string} address
     * @returns {boolean}
     */
    isUsedWallet(address) {
      const account = this.wallets[address];
      return account ? !account.isPublic && !account.isHardware : false;
    },
  },
  mounted() {
    if (this.autoLoad) {
      this.getNextAddressess();
    }
  },
  components: { WalletItem },
  model: {
    prop: 'isGettingAddresses',
    event: 'input',
  },
};
</script>
