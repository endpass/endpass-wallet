<template lang="html">
  <div class="account-chooser field has-addons">
    <div class="control">
      <div class="select">
        <select @change="setActiveAccount" v-model="selectedAccountId">
          <option v-for="(account, i in accounts"
                  :value="i">
          {{i}}. {{account.getAddressString() |truncateAddr}}
          </option>
        </select>
      </div>
    </div>
    <div :disabled="!hdWallet" class="new-account control">
      <a class="button is-primary" @click="createNewAccount">&plus;</a>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selectedAccountId: 0
    }
  },
  computed: {
    activeAccount () {
      return this.$store.state.accounts.activeAccount
    },
    selectedAccount () {
      if (!this.accounts.length) {
        return
      }
      return this.accounts[this.selectedAccountId]
    },
    // All accounts that have been created
    accounts () {
      return this.$store.state.accounts.accounts
    },
    hdWallet () {
      return this.$store.state.accounts.hdWallet
    }
  },
  methods: {
    setActiveAccount() {
      let account = this.selectedAccount
      if (!account) {
        return
      }
      this.$store.commit('accounts/setActiveAccount', account)
      this.$store.dispatch('accounts/updateBalance')
      this.$store.dispatch('accounts/subscribeOnBalanceUpdates')
    },
    // Create the next account derived from the HD wallet seed
    // TODO consider gap limit if multiple hd accounts are already used
    createNewAccount() {
      if (!this.hdWallet) {
        return
      }
      let i = this.accounts.length
      let account = this.hdWallet.deriveChild(i).getWallet()
      this.$store.commit('accounts/addAccount', account);
      this.selectedAccountId = i
      this.setActiveAccount()
    }
  },
  filters: {
    // Truncate an address to the first 4 and last 4 characters
    truncateAddr(value) {
      if (!value) return ''
      value = value.toString()
    return `${value.substr(0,4)}...${value.substr(value.length-4)}`
    }
  }
}
</script>
