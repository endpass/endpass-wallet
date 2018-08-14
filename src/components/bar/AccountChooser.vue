<template lang="html">
  <div class="account-chooser field has-addons">
    <div class="control is-expanded">

      <multiselect
        :options="walletsAddresses"
        label="Account"
        :option-height="height"
        :searchable="false"
        :show-labels="false"
        :allow-empty="false"
        :value="activeAddress"
        @select="selectWallet"
        placeholder="Select account"
      >
        <span class="multiselect-single" slot="singleLabel" slot-scope="props">
          <account :class="singleClass" :address="address" :size="width" />
        </span>
        <span class="multiselect-option" slot="option" slot-scope="props">
          <account :class="optionClass" :address="props.option" :size="width" />
        </span>
      </multiselect>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import { mapState, mapActions } from 'vuex';
import Account from '@/components/Account';

export default {
  data() {
    return {
      newAccountModalOpen: false,
    };
  },
  props: {
    // Maximum width of address
    width: {
      type: Number,
      default: 50,
    },
    height: {
      type: Number,
      default: 32,
    },
    // Classes to set on selected single account
    singleClass: {
      type: Object,
    },
    // Classes to set on non selected options
    optionClass: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      wallets: state => state.accounts.wallets,
      address: state =>
        state.accounts.address &&
        state.accounts.address.getChecksumAddressString(),
    }),
    activeAddress: {
      get() {
        return this.address.replace(/^0x/, '');
      },
      set(newValue) {
        this.selectWallet(newValue);
      },
    },
    walletsAddresses() {
      return Object.keys(this.wallets);
    },
  },
  methods: {
    ...mapActions('accounts', ['selectWallet']),
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
  },
};
</script>


<style lang="scss">
</style>
