<template lang="html">
  <div class="account-chooser field has-addons">
    <div v-if="hdWallet" class="control">

      <multiselect
                         :options="Object.keys(wallets)"
                         label="Account"
                         :option-height="32"
                         :searchable="false"
                         :show-labels="false"
                         :allow-empty="false"
                         :value="activeAddress"
                         @select="selectWallet"
                         placeholder="Select account"
                         >

                         <template slot="singleLabel" slot-scope="props">
                           <account :address="address" :size="8" />
                         </template>
                         <template slot="option" slot-scope="props">
                           <account :address="props.option" :size="8" />
                         </template>
      </multiselect>
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
import Multiselect from 'vue-multiselect';
import { mapState, mapActions } from 'vuex';
import Account from '@/components/Account';
import NewAccountModal from '@/components/NewAccountModal';

export default {
  data() {
    return {
      newAccountModalOpen: false,
    };
  },
  computed: {
    ...mapState({
      hdWallet: state => state.accounts.hdWallet,
      wallets: state => state.accounts.wallets,
      address: state =>
        state.accounts.address && state.accounts.address.getAddressString(),
    }),
    activeAddress: {
      get() {
        return this.address.replace(/^0x/, '');
      },
      set(newValue) {
        this.selectWallet(newValue);
      },
    },
  },
  methods: {
    ...mapActions('accounts', ['selectWallet']),
    openNewAccountModal() {
      this.newAccountModalOpen = true;
    },
    closeNewAccountModal() {
      this.newAccountModalOpen = false;
    },
  },
  filters: {
    // Truncate an address to the first 4 and last 4 characters
    truncateAddr(value) {
      if (!value) return '';
      value = value.toString();
      return `${value.substr(0, 4)}...${value.substr(value.length - 4)}`;
    },
  },
  components: {
    Multiselect,
    Account,
    NewAccountModal,
  },
};
</script>
