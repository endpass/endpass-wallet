<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <template slot="header">
        {{ $t('components.newAccountModel.header') }}
      </template>

      <div v-if="!isAccountCreated">
        <p class="subtitle">
          {{ $t('components.newAccountModel.youCurrentlyHave') }}
          <strong>{{ walletsCount }}</strong>
          {{ $t('components.newAccountModel.activeAddreessesInWallets') }}
        </p>
        <p class="subtitle">
          {{ $t('components.newAccountModel.clickButtonToImportAddress') }}
        </p>
      </div>

      <div v-else>
        <p class="subtitle">
          {{ $t('components.newAccountModel.newAddressCreates') }}
        </p>

        <div class="message">
          <div class="message-header">
            <p>{{ $t('components.newAccountModel.publicAdress') }}</p>
          </div>
          <div class="message-body">
            <p>{{ $t('components.newAccountModel.useAddressToReceive') }}</p>
            <p class="code address">
              {{ address }}
            </p>
          </div>
        </div>

        <div class="message is-warning">
          <div class="message-header">
            <p>{{ $t('components.newAccountModel.privateKey') }}</p>
          </div>
          <div class="message-body">
            <p class="bold">
              {{ $t('components.newAccountModel.privateKeyDisclamer') }}
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
              {{ $t('components.newAccountModel.createAdress') }}
            </v-button>
          </v-form>
          <v-form
            :is-form-valid="true"
            @submit="importNewAccount"
          >
            <v-button class-name="is-primary is-medium">
              {{ $t('components.newAccountModel.importAddress') }}
            </v-button>
          </v-form>
        </template>
        <v-button
          v-else
          class-name="is-primary is-medium"
          data-test="account-modal-close-button"
          @click="close"
        >
          {{ $t('global.close') }}
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
