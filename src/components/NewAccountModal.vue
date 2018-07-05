<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <template slot="header">Create New Address</template>

      <div v-if="!createdAccount">
        <p class="subtitle">You currently have
        <strong>{{wallets.length}}</strong> active addresses in your wallet.</p>
        <p class="subtitle">Click the button below to create an additional
      address you can use to receive Ethereum and tokens.</p>
        <v-form>
        <v-input v-model="walletPassword"
                 label="Wallet password"
                 name="walletPassword"
                 type="password"
                 validator="required|min:8"
                 data-vv-as="password"
                 aria-describedby="walletPassword"
                 placeholder="Wallet password"
                 required></v-input>
         <v-button :loading="createdingAccount"
                   className="is-primary is-medium"
                   @click.prevent="createNewAccount">Create address</v-button>
        </v-form>
      </div>
      <div v-else>
        <p class="subtitle">New Address Created</p>

        <div class="message">
          <div class="message-header">
            <p>Public Address</p>
          </div>
          <div class="message-body">
            <p>Use this address to receive Ether and tokens.</p>
            <p class="code address">{{address}}</p>
          </div>
        </div>

        <div class="message is-warning">
          <div class="message-header">
            <p>Private Key</p>
          </div>
          <div class="message-body">
            <p class="bold">Save this for your records and DO NOT share it
            with anyone!</p>
            <p class="code">{{privateKey}}</p>
          </div>
        </div>

      </div>
    </v-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import VModal from '@/components/ui/VModal'
import VInput from '@/components/ui/form/VInput.vue';
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  data () {
    return {
      createdAccount: null,
      createdingAccount: false,
      privateKey: '',
      walletPassword: ''
    }
  },
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
      address: state => state.accounts.address && state.accounts.address.getAddressString(),
      wallets: state => state.accounts.wallets
    })
  },
  methods: {
    ...mapActions('accounts', ['generateWallet']),
    // Create the next account derived from the HD wallet seed
    // TODO consider gap limit if multiple hd accounts are already used
    async createNewAccount() {
      this.createdingAccount = true;
      await new Promise(res => setTimeout(res, 20));
      this.generateWallet(this.walletPassword);
      this.privateKey = this.wallet.getPrivateKeyString(this.walletPassword);
      this.createdingAccount = false;
      this.createdAccount = true;
    },
    close() {
      this.$emit('close')
    }
  },
  components: {
    VModal,
    VInput,
    VForm,
    VButton
  }
}
</script>

<style lang="scss">
</style>
