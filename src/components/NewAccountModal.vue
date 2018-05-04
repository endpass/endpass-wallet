<template lang="html">
  <div class="new-account-modal">
    <modal-component @close="close">
      <template slot="header">Create New Address</template>

      <div v-if="!createdAccount">
        <p class="subtitle">Click the button below to create an additional
      address you can use to receive Ethereum and tokens.</p>
        <button class="button is-primary" @click="createNewAccount">Create
          Address</button>
      </div>
      <div v-else>
        <p class="subtitle">New Account Created</p>
        <div class="box">
          <span class="text-label">Address</span>
          <span class="address">{{createdAccount.getAddressString()}}</span>
        </div>
      </div>

    </modal-component>
  </div>
</template>

<script>
import ModalComponent from '@/components/ModalComponent'

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
    // Create the next account derived from the HD wallet seed
    // TODO consider gap limit if multiple hd accounts are already used
    createNewAccount() {
      if (!this.hdWallet) {
        return
      }
      let i = this.accounts.length
      let account = this.hdWallet.deriveChild(i).getWallet()
      this.$store.commit('accounts/addAccount', account)
      this.createdAccount = account
    },
    close() {
      this.$emit('close')
    }
  },
  components: {
    ModalComponent
  }
}
</script>

<style lang="scss">
</style>
