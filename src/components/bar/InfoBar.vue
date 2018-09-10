<template>
  <div class="section info-bar" :class="networkClass">
    <div class="info-item">
      <div class="field">
				<p class="heading">Status</p>
				<div class="control is-expanded">
					<sync-status/>
				</div>
      </div>
    </div>

    <div class="info-item">
			<p class="heading">Balance</p>
      <balance :amount="balance || 0" class="level-stat"
      :currency="activeCurrency.name" :round="4" />
    </div>
    <div class="info-item">
			<p class="heading">Value</p>
      <balance :is-loading="priceLoading" :amount="balance || 0"
        :price="price || 0" :decimals="2" :round="0"
      :currency="fiatCurrency" v-on:update="updatePrice" class="level-stat" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue';
import SyncStatus from '@/components/bar/SyncStatus.vue';
import Balance from '@/components/Balance';
import net from '@/mixins/net';

export default {
  computed: {
    ...mapState({
      fiatCurrency: state => state.user.settings.fiatCurrency,
      activeCurrency: state => state.web3.activeCurrency,
      price: state => state.price.price,
      priceLoading: state => state.price.isLoading,
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
    SyncStatus,
    Balance,
  },
  mixins: [net],
};
</script>

<style lang="scss">
.info-bar {
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-template-rows: 1fr;
  justify-content: center;
  align-items: stretch;

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

.info-item {
  min-width: 0;
  white-space: nowrap;
}
</style>
