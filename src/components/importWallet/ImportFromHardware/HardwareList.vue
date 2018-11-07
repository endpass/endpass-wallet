<template>
  <div class="column">
    <v-spinner
      v-if="isLoading"
      :is-loading="true"
      label="Please, allow access for import"
      is-label-under-spinner
    />
    <div v-show="!isLoading">
      <hardware-account
        v-for="address in addresses"
        :key="address"
        :address="address"
        :is-active="address === activeAddress"
        @click="activeAddress = address"
      />
      <v-pagination @input="changePage" />
      <div class="buttons">
        <v-button
          :disabled="!activeAddress"
          :loading="isImporting"
          class-name="is-primary is-medium"
          @click="handleImport"
        >
          Import
        </v-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VList from '@/components/ui/VList';
import VButton from '@/components/ui/form/VButton';
import VSpinner from '@/components/ui/VSpinner';
import VPagination from '@/components/ui/VPagination';
import HardwareAccount from './HardwareAccount';

export default {
  name: 'HardwareList',
  props: {
    walletType: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    activeAddress: null,
    isLoading: true,
    isImporting: false,
    addresses: [],
    offset: 0,
    limit: 10,
  }),
  methods: {
    ...mapActions('accounts', ['addPublicWallet', 'getNextWalletsFromHd']),
    async getNextAddressess({ offset = this.offset, limit = this.limit } = {}) {
      this.isLoading = true;

      try {
        this.addresses = await this.getNextWalletsFromHd({
          offset,
          limit,
          walletType: this.walletType,
        });
        this.isLoading = false;
      } catch (error) {
        this.$notify(error);
      }
    },
    changePage(page) {
      this.offset = this.limit * (page - 1);
      this.getNextAddressess();
    },
    async handleImport() {
      this.isImporting = true;

      try {
        const { activeAddress: address, walletType: type } = this;
        const index = this.addresses.indexOf(address);
        const info = { type, index };

        await this.addPublicWallet({ address, info });
        this.$router.push('/');
      } catch (e) {
        this.$notify({
          title: 'Importing error',
          text: 'An error occurred while importing wallet. Please try again.',
          type: 'is-danger',
        });
        this.isImporting = false;
      }
    },
  },
  mounted() {
    this.getNextAddressess();
  },
  components: {
    VButton,
    VList,
    VPagination,
    VSpinner,
    HardwareAccount,
  },
};
</script>

<style lang="scss">
</style>
