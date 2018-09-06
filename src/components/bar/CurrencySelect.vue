<template>
  <div class="provider-select">
    <div class="net-select">
      <multiselect
         :options="currencies"
         track-by="id" label="name"
                       :show-labels="false"
                       :allow-empty="true"
                       :value="activeCurrency"
                       @select="selectCurrency"
                       placeholder="Select currency"
                       />
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import { mapActions, mapState } from 'vuex';

import { CURRENCIES } from '@/constants';

export default {
  data: function() {
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
    Multiselect,
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
