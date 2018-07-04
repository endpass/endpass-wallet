<template lang="html">
  <div class="account-chooser field has-addons">
    <div v-if="hdWallet" class="control">
      <div class="select">
        <select @change="selectWallet(wallet)">
          <option value="" v-for="(wallet, key, index) in wallets"
                  :value="key">
          {{index}}. {{address |truncateAddr}}
          </option>
        </select>
      </div>
    </div>
    <div v-else-if="address" class="control">
        {{address |truncateAddr}}
    </div>
    <div v-if="hdWallet" class="new-account control">
      <a class="button is-primary" @click="openNewAccountModal">&plus;</a>
    </div>
    <new-account-modal @close="closeNewAccountModal"
      v-if="newAccountModalOpen"/>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import NewAccountModal from '@/components/NewAccountModal'
import accounts from '@/mixins/accounts'

export default {
  data () {
    return {
      newAccountModalOpen: false
    }
  },
  computed: {
    ...mapState({
      hdWallet: state => state.accounts.hdWallet,
      wallets: state => state.accounts.wallets,
      address: state => state.accounts.address && state.accounts.address.getAddressString(),
    }),
  },
  methods: {
    ...mapActions('accounts', {
      setActiveAccountToStore:'setActiveAccount',
    }),
    ...mapMutations('accounts', {
      selectWallet:'selectWallet',
    }),
    setActiveAccount() {
      let account = this.selectedAccount
      if (!account) {
        return
      }
      this.setActiveAccountToStore(account);
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
  },
  mixins: [accounts]
}
</script>
