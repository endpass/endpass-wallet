<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <template slot="header">Create New Address</template>

      <div v-if="!isAccountCreated">
        <p class="subtitle">You currently have
        <strong>{{ Object.keys(wallets).length }}</strong> active addresses in your wallet.</p>
        <p class="subtitle">Click the button below to create or import an additional address you can use to receive Ethereum and tokens.</p>
      </div>
      <div v-else>
        <p class="subtitle">New Address Created</p>

        <div class="message">
          <div class="message-header">
            <p>Public Address</p>
          </div>
          <div class="message-body">
            <p>Use this address to receive Ether and tokens.</p>
            <p class="code address">{{ address }}</p>
          </div>
        </div>

        <div class="message is-warning">
          <div class="message-header">
            <p>Private Key</p>
          </div>
          <div class="message-body">
            <p class="bold">Save this for your records and DO NOT share it
            with anyone!</p>
            <p class="code">{{ privateKey }}</p>
          </div>
        </div>

      </div>

      <div
        v-if="!isAccountCreated"
        slot="footer"
        class="buttons"
      >
        <v-form @submit="createNewAccount">
          <v-button
            :loading="isCreatingAccount"
            class-name="is-primary is-medium"
          >Create address</v-button>
        </v-form>
        <v-form @submit="importNewAccount">
          <v-button
            class-name="is-primary is-medium"
          >Import address</v-button>
        </v-form>
      </div>
    </v-modal>
    <password-modal
      v-if="isPasswordModal"
      @confirm="confirmPassword"
      @close="togglePasswordModal"
    />
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import VModal from '@/components/ui/VModal';
import VInput from '@/components/ui/form/VInput.vue';
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import PasswordModal from '@/components/modal/PasswordModal';

export default {
  name: 'NewAccountModal',
  data() {
    return {
      isAccountCreated: null,
      isCreatingAccount: false,
      privateKey: '',
      isPasswordModal: false,
    };
  },
  computed: {
    ...mapState({
      wallets: state => state.accounts.wallets,
      address: state => state.accounts.address,
    }),
    ...mapGetters('accounts', ['wallet']),
  },
  methods: {
    ...mapActions('accounts', ['generateWallet', 'validatePassword']),
    importNewAccount() {
      this.$router.push('import');
      this.close();
    },
    // Create the next account derived from the HD wallet seed
    // TODO consider gap limit if multiple hd accounts are already used
    createNewAccount() {
      this.togglePasswordModal();
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'create_new_account',
      });
    },
    togglePasswordModal() {
      this.isPasswordModal = !this.isPasswordModal;
    },
    async confirmPassword(password) {
      this.togglePasswordModal();
      this.isCreatingAccount = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        await this.generateWallet(password);
        this.privateKey = await this.wallet.getPrivateKeyString(password);
        this.isCreatingAccount = false;
        this.isAccountCreated = true;
      } catch (e) {
        this.isCreatingAccount = false;
        this.$notify({
          title: 'Something went wrong',
          text: 'Сould not create account. Please try again.',
          type: 'is-danger',
        });
      }
    },
    close() {
      this.$emit('close');
    },
  },
  components: {
    VModal,
    VInput,
    VForm,
    VButton,
    PasswordModal,
  },
};
</script>

<style lang="scss">
</style>
