<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <template slot="header">
        Create New Address
      </template>

      <div v-if="!isAccountCreated">
        <p class="subtitle">
          You currently have
          <strong>{{ walletsCount }}</strong>
          active addresses in your wallet.
        </p>
        <p class="subtitle">
          Click the button below to create or import an additional address you
          can use to receive Ethereum and tokens.
        </p>
      </div>
      <div v-else>
        <p class="subtitle">
          New Address Created
        </p>

        <div class="message">
          <div class="message-header">
            <p>Public Address</p>
          </div>
          <div class="message-body">
            <p>Use this address to receive Ether and tokens.</p>
            <p class="code address">
              {{ address }}
            </p>
          </div>
        </div>

        <div class="message is-warning">
          <div class="message-header">
            <p>Private Key</p>
          </div>
          <div class="message-body">
            <p class="bold">
              Save this for your records and DO NOT share it with anyone!
            </p>
            <p class="code">
              {{ privateKey }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="!isAccountCreated"
        slot="footer"
        class="buttons"
      >
        <v-form
          data-test="createNewAccount"
          @submit="createNewAccount"
        >
          <v-button class-name="is-primary is-medium">
            Create address
          </v-button>
        </v-form>
        <v-form
          :is-form-valid="true"
          @submit="importNewAccount"
        >
          <v-button class-name="is-primary is-medium">
            Import address
          </v-button>
        </v-form>
      </div>
    </v-modal>
    <v-modal
      v-if="isWalletsListModal"
      @close="handleWalletsListModalClose"
    >
      <template slot="header">
        Select Your Address
      </template>
      <wallets-list
        v-model="bridgeButtonListIsLoading"
        :type="walletType"
        :auto-load="true"
        :is-importing="bridgeButtonListIsImporting"
        @select="setSelectedAddress"
      />
      <wallet-add-button
        v-show="!bridgeButtonListIsLoading"
        slot="footer"
        v-model="bridgeButtonListIsImporting"
        :type="walletType"
        :selected-address="bridgeButtonListSelectedAddress"
        @success="successAddWallet"
      >
        Add
      </wallet-add-button>
    </v-modal>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { BridgeButtonListMixin } from '@/components/walletsListFromHd';
import { Wallet } from '@/class';

/** @type {{HD_MAIN,getTypes}} */
const WALLET_TYPES = Wallet.getTypes();

export default {
  name: 'NewAccountModal',
  data() {
    return {
      privateKey: '',
      isAccountCreated: false,
      isWalletsListModal: false,
      walletType: WALLET_TYPES.HD_MAIN,
    };
  },
  computed: {
    ...mapState({
      wallets: state => state.accounts.wallets,
      address: state => state.accounts.address,
    }),
    ...mapGetters('accounts', ['wallet']),
    walletsCount() {
      return Object.keys(this.wallets).length;
    },
  },
  methods: {
    ...mapActions('accounts', ['validatePassword']),
    importNewAccount() {
      this.$router.push('import');
      this.close();
    },
    // Create the next account derived from the HD wallet seed
    // TODO consider gap limit if multiple hd accounts are already used
    createNewAccount() {
      this.isWalletsListModal = true;
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'create_new_account',
      });
    },
    close() {
      this.$emit('close');
    },

    /**
     * @param {string} password
     * @returns {Promise<void>}
     */
    async successAddWallet(password) {
      this.isAccountCreated = true;
      this.isWalletsListModal = false;
      this.privateKey = await this.wallet.getPrivateKeyString(password);
    },

    handleWalletsListModalClose() {
      this.isWalletsListModal = false;
    },
  },
  mixins: [BridgeButtonListMixin],
};
</script>
