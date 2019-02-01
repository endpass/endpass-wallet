<template>
  <div class="provider-select">
    <div class="net-select">
      <vue-multiselect
        :options="currencies"
        :show-labels="false"
        :allow-empty="true"
        :value="activeCurrency"
        track-by="id"
        label="name"
        placeholder="Select currency"
        data-test="currency-select"
        @select="selectCurrency"
      />
    </div>
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import { mapActions, mapState } from 'vuex';

import { CURRENCIES } from '@/constants';

export default {
  name: 'CurrencySelect',

  data() {
    return {
      currencies: CURRENCIES,
    };
  },
  computed: {
    ...mapState({
      activeCurrency: state => state.web3.activeCurrency,
    }),
  },
  methods: {
    ...mapActions('web3', ['changeCurrency']),
    selectCurrency(currency) {
      this.changeCurrency({
        currencyId: currency.id,
      });
    },
  },
  components: {
    VueMultiselect,
  },
};
</script>


<style lang="scss">
.provider-select {
  .net-select {
    display: inline-block;
    max-width: 100%;
    position: relative;
    vertical-align: top;
  }
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
