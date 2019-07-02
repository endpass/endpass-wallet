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
        slot="footer"
        class="buttons"
      >
        <template v-if="!isAccountCreated">
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
        </template>
        <v-button
          v-else
          class-name="is-primary is-medium"
          data-test="account-modal-close-button"
          @click="close"
        >
          Close
        </v-button>
      </div>
    </v-modal>

    <password-modal
      v-if="isAwaitingPassword"
      @confirm="handleCreateWalletConfirm"
      @close="handleCreateWalletCancel"
    />
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { BridgeButtonListMixin } from '@/components/walletsListFromHd';
import PasswordModal from '@/components/modal/PasswordModal';
import { Wallet } from '@/class';

/** @type {{HD_MAIN,getTypes}} */
const WALLET_TYPES = Wallet.getTypes();

export default {
  name: 'NewAccountModal',

  data() {
    return {
      privateKey: '',
      walletType: WALLET_TYPES.HD_MAIN,
      isAccountCreated: false,
      isAwaitingPassword: false,
    };
  },

  computed: {
    ...mapState({
      wallets: state => state.accounts.wallets,
      address: state => state.accounts.address,
    }),
    ...mapGetters('accounts', ['wallet', 'walletsCount']),

    address() {
      return this.wallet.address;
    },

    walletsCount() {
      return Object.keys(this.wallets).length;
    },
  },

  methods: {
    ...mapActions('accounts', ['addNextWalletFromHd']),

    async handleCreateWalletConfirm(password) {
      await this.addNextWalletFromHd({
        walletType: this.walletType,
        password,
      });
      this.privateKey = await this.wallet.getPrivateKeyString(password);
      this.isAccountCreated = true;
      this.isAwaitingPassword = false;
    },

    handleCreateWalletCancel() {
      this.isAwaitingPassword = false;
    },

    importNewAccount() {
      this.$router.push('import');
      this.close();
    },

    createNewAccount() {
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'create_new_account',
      });
      this.isAwaitingPassword = true;
    },

    close() {
      this.$emit('close');
    },
  },

  mixins: [BridgeButtonListMixin],

  components: {
    PasswordModal,
  },
};
</script>
