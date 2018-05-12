<template lang="html">
  <div class="account-chooser field has-addons">
    <div class="control">
      <div class="select">
        <select @change="setActiveAccount" v-model="selectedAccountId">
          <option v-for="(account, i) in accounts"
                  :value="i">
          {{i}}. {{account.getAddressString() |truncateAddr}}
          </option>
        </select>
      </div>
    </div>
    <div :disabled="!hdWallet" class="new-account control">
      <a class="button is-primary" @click="openNewAccountModal">&plus;</a>
    </div>
    <new-account-modal @close="closeNewAccountModal"
      v-if="newAccountModalOpen"/>
  </div>
</template>

<script>
import NewAccountModal from '@/components/NewAccountModal'

export default {
  data () {
    return {
      selectedAccountId: 0,
      newAccountModalOpen: false
    }
  },
  computed: {
    activeAccount () {
      return this.$store.state.accounts.activeAccount
    },
    hdWallet () {
      return this.$store.state.accounts.hdWallet
    },
    selectedAccount () {
      if (!this.accounts.length) {
        return
      }
      return this.accounts[this.selectedAccountId]
    },
    accounts () {
      return this.$store.state.accounts.accounts
    },
  },
  methods: {
    setActiveAccount() {
      let account = this.selectedAccount
      if (!account) {
        return
      }
      this.$store.dispatch('accounts/setActiveAccount', account);
    },
    openNewAccountModal() {
      this.newAccountModalOpen = true
    },
    closeNewAccountModal() {
      this.newAccountModalOpen = false
    }
  },
  filters: {
    // Truncate an address to the first 4 and last 4 characters
    truncateAddr(value) {
      if (!value) return ''
      value = value.toString()
    return `${value.substr(0,4)}...${value.substr(value.length-4)}`
    }
  },
  components: {
    NewAccountModal
  }
}
</script>
