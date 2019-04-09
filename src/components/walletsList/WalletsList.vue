<template>
  <div class="column">
    <div
      v-if="!isLoading && !addresses.length"
      class="buttons"
    >
      <v-button
        :loading="isImporting"
        class-name="is-primary is-medium"
        @click="getNextAddressess"
      >
        Load wallets
      </v-button>
    </div>
    <v-spinner
      v-if="isLoading"
      :is-loading="true"
      label="Please, allow access for import"
      is-label-under-spinner
    />
    <div v-show="!isLoading && addresses.length">
      <wallet-item
        v-for="address in addresses"
        :key="address"
        :address="address"
        :is-active="address === activeAddress"
        @click="setActiveAddress(address)"
      />
      <v-pagination @input="changePage" />
      <div class="buttons">
        <v-button
          :disabled="!activeAddress"
          :loading="isImporting"
          class-name="is-primary is-medium"
          data-test="import-wallet-button"
          @click="handleImport"
        >
          Import
        </v-button>
      </div>
    </div>
    <password-modal
      v-if="isPasswordModal"
      @close="togglePasswordModal"
      @confirm="handleImportByPassword"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import modalMixin from '@/mixins/modal';
import PasswordModal from '@/components/modal/PasswordModal';
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
  },
  data: () => ({
    activeAddress: null,
    isLoading: false,
    isImporting: false,
    isPasswordModal: false,
    addresses: [],
    offset: 0,
    limit: 10,
  }),
  computed: {
    ...mapGetters('accounts', ['isHDv3WalletByType']),
  },
  methods: {
    ...mapActions('accounts', [
      'addPublicWallet',
      'getNextWalletsFromHd',
      'addHdChildWallets',
    ]),

    async getNextAddressess({ offset = this.offset, limit = this.limit } = {}) {
      this.isLoading = true;

      try {
        this.addresses = await this.getNextWalletsFromHd({
          offset,
          limit,
          walletType: this.type,
        });
      } catch (error) {
        this.$notify(error);
      } finally {
        this.isLoading = false;
      }
    },
    async changePage(page) {
      this.offset = this.limit * (page - 1);
      await this.getNextAddressess();
    },
    async handleImportByPassword(password) {
      await this.addWallet(password);
    },
    async handleImport() {
      if (this.isHDv3WalletByType(this.type)) {
        this.isPasswordModal = true;
      } else {
        await this.addWallet();
      }
    },
    async addWallet(password) {
      this.isImporting = true;
      try {
        const { activeAddress: address, type } = this;
        const index = this.addresses.indexOf(address);
        if (index === -1) {
          throw new Error('Address not selected');
        }

        if (this.isHDv3WalletByType(type)) {
          await this.addHdChildWallets({
            address,
            index,
            password,
            type,
          });
        } else {
          const info = { type, index };
          await this.addPublicWallet({ address, info });
        }
        this.$router.push('/');
      } catch (e) {
        this.$notify({
          title: 'Importing error',
          text: 'An error occurred while importing wallet. Please try again.',
          type: 'is-danger',
        });
      } finally {
        this.isImporting = false;
      }
    },
    setActiveAddress(address) {
      this.activeAddress = address;
      this.$emit('select', address);
    },
  },
  mounted() {
    if (this.autoLoad) {
      this.getNextAddressess();
    }
  },
  mixins: [modalMixin],
  components: {
    WalletItem,
    PasswordModal,
  },
};
</script>

<style lang="scss"></style>
