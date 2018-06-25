<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <template slot="header">Create New Address</template>

      <div v-if="!createdAccount">
        <p class="subtitle">You currently have
        <strong>{{accounts.length}}</strong> active addresses in your wallet.</p>
        <p class="subtitle">Click the button below to create an additional
      address you can use to receive Ethereum and tokens.</p>
      </div>
      <div v-else>
        <p class="subtitle">New Address Created</p>

        <div class="message">
          <div class="message-header">
            <p>Public Address</p>
          </div>
          <div class="message-body">
            <p>Use this address to receive Ether and tokens.</p>
            <p class="code address">{{createdAccount.getAddressString()}}</p>
          </div>
        </div>

        <div class="message is-warning">
          <div class="message-header">
            <p>Private Key</p>
          </div>
          <div class="message-body">
            <p class="bold">Save this for your records and DO NOT share it
            with anyone!</p>
            <p class="code">{{createdAccount.getPrivateKeyString()}}</p>
          </div>
        </div>

      </div>

      <div slot="footer">
        <div v-if="!createdAccount">
          <a class="button is-primary" @click="createNewAccount">Create
            New Address</a>
          <a class="button" @click="close">Cancel</a>
        </div>
        <div v-else>
          <a class="button is-primary" @click="close">Close</a>
        </div>
      </div>

    </v-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VModal from '@/components/ui/VModal'

export default {
  data () {
    return {
      createdAccount: null
    }
  },
  computed: {
    hdWallet () {
      return this.$store.state.accounts.hdWallet
    },
    // All accounts that have been created
    accounts () {
      return this.$store.state.accounts.accounts
    }
  },
  methods: {
    ...mapActions('accounts', ['addAccount']),
    // Create the next account derived from the HD wallet seed
    // TODO consider gap limit if multiple hd accounts are already used
    createNewAccount() {
      if (!this.hdWallet) {
        return
      }
      let i = this.accounts.length
      let account = this.hdWallet.deriveChild(i).getWallet()
      this.addAccount(account);
      this.createdAccount = account
    },
    close() {
      this.$emit('close')
    }
  },
  components: {
    VModal,
  }
}
</script>

<style lang="scss">
</style>
