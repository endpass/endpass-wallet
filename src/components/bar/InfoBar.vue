<template>
  <div class="section info-bar" :class="networkClass">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <div class="level-control">
              <p class="heading">Current Network</p>
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
          <div class="level-item">
            <div class="level-control">
              <span  v-if="address">
                <p class="heading">Current Account</p>
                <account-chooser/>
              </span>
              <router-link :to="{name: 'NewWallet'}" class="button
              is-primary" v-else>Create Wallet</router-link>
            </div>
          </div>
          <div class="level-item" v-if="balance !== null">
            <balance :amount="balance" class="level-stat" />
          </div>
          <div class="level-item" v-if="price !== null && balance !== null">
            <balance :amount="balance" :price="price" :decimals="2" currency="USD" v-on:update="updatePrice" class="level-stat" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue'
import ProviderSelect from '@/components/bar/ProviderSelect.vue'
import SyncStatus from '@/components/bar/SyncStatus.vue'
import Balance from '@/components/Balance'
import net from '@/mixins/net'

export default {
  computed: {
    ...mapState({
      price: state => state.price.price,
      address: state => state.accounts.address && state.accounts.address.getAddressString()
    }),
    ...mapGetters('accounts', {
      balance: 'balance'
    })
  },
  methods: {
    ...mapActions('price', ['updatePrice']),
  },
  components: {
    AccountChooser,
    ProviderSelect,
    SyncStatus,
    Balance
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

  .title {
    color: $white;
  }
}
</style>
