<template>
  <div class="section info-bar" :class="networkClass">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <div class="level-control">
              <p class="heading">Currency</p>
              <currency-select/>
            </div>
          </div>
          <div class="level-item">
            <div class="level-control">
              <p class="heading">Network</p>
              <provider-select/>
            </div>
          </div>
          <div class="level-item">
            <div class="level-control">
              <sync-status/>
            </div>
          </div>
        </div>

        <div class="level-right">
          <div class="level-item" v-if="balance !== null">
            <balance :amount="balance" class="level-stat" :currency="activeCurrency.name" />
          </div>
          <div class="level-item" v-if="price !== null && balance !== null">
            <balance :amount="balance" :price="price" :decimals="2" :currency="fiatCurrency" v-on:update="updatePrice" class="level-stat" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue';
import ProviderSelect from '@/components/bar/ProviderSelect.vue';
import CurrencySelect from '@/components/bar/CurrencySelect.vue';
import SyncStatus from '@/components/bar/SyncStatus.vue';
import Balance from '@/components/Balance';
import net from '@/mixins/net';

export default {
  computed: {
    ...mapState({
      fiatCurrency: state => state.accounts.settings.fiatCurrency,
      activeCurrency: state => state.web3.activeCurrency,
      price: state => state.price.price,
      address: state =>
        state.accounts.address && state.accounts.address.getAddressString(),
    }),
    ...mapGetters('accounts', {
      balance: 'balance',
    }),
  },
  methods: {
    ...mapActions('price', ['updatePrice']),
  },
  components: {
    AccountChooser,
    ProviderSelect,
    SyncStatus,
    Balance,
    CurrencySelect,
  },
  mixins: [net],
};
</script>

<style lang="scss">
.info-bar {
  padding: 0.25rem 1rem;
  color: $white;
  &.mainnet {
    background-color: $dark-blue;
  }
  &.testnet {
    background-color: darken($warning, 35%);
  }
  &.classic {
    background-color: darken($danger, 35%);
  }
  .title {
    color: $white;
  }
}
</style>
