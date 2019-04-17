<template>
  <div class="buttons">
    <password-modal
      v-if="isPasswordModal"
      @close="handlePasswordModalClose"
      @confirm="addWallet"
    />
    <v-button
      :disabled="!selectedAddress"
      :loading="isAddingWallet"
      class-name="is-primary is-medium"
      data-test="import-wallet-button"
      @click="handleImport"
    >
      <slot />
    </v-button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PasswordModal from '@/components/modal/PasswordModal';

export default {
  name: 'WalletAddButton',
  props: {
    isAddingWallet: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
    },
    selectedAddress: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isPasswordModal: false,
    };
  },
  methods: {
    ...mapActions('accounts', ['addPublicWallet', 'addHdChildWallets']),
    ...mapGetters('accounts', ['isHDv3WalletByType']),

    /**
     * @param {string} [password]
     * @returns {Promise<void>}
     */
    async addWallet(password) {
      this.$emit('input', true);
      try {
        const { type } = this;
        const { address, index } = this.selectedAddress;
        if (index === -1) {
          throw new Error('Address not selected');
        }

        if (this.isHDv3WalletByType(this.type)) {
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
        this.$emit('success', password);
      } catch (e) {
        this.$notify({
          title: 'Importing error',
          text: 'An error occurred while importing wallet. Please try again.',
          type: 'is-danger',
        });
      } finally {
        this.$emit('input', false);
      }
    },

    /**
     * @returns {Promise<void>}
     */
    async handleImport() {
      if (this.isHDv3WalletByType(this.type)) {
        this.isPasswordModal = true;
        return;
      }
      await this.addWallet();
    },

    handlePasswordModalClose() {
      this.isPasswordModal = false;
    },
  },
  components: { PasswordModal },
  model: {
    prop: 'isAddingWallet',
    event: 'input',
  },
};
</script>
