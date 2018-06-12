<template lang="html">
  <div class="tokens-page">
    <div class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-half">
            <div class="card app-card">
              <div class="card-content">
                <nav class="panel">
                  <p class="panel-heading">
                  Your Tokens
                  </p>
                  <div class="panel-block">
                    <search-input v-model="search"></search-input>
                  </div>
                  <div class="scroller">
                    <a v-for="token in activeTokens" :key="token.address + 'sub'" class="panel-block is-clearfix is-block">
                      <span class="token-symbol">{{token.symbol}}</span>
                      <span class="token-name">{{token.name}}</span>
                      <balance :amount="getTokenAmount(token)" :currency="''"/>
                      <balance v-if="prices && prices[token.symbol]" :price="prices[token.symbol][currency]" :amount="getTokenAmount(token)" :currency="currency" v-on:update="updateTokenPrice(token.symbol)" :decimals="2"/>
                    </a>
                  </div>
                </nav>
              </div>
            </div>
          </div>
          <div class="column is-half">
            <div class="card app-card">
              <div class="card-content">
                <nav class="panel">
                  <p class="panel-heading">
                  Add Token
                  </p>
                  <div class="panel-block">
                    <search-input v-model="search"></search-input>
                  </div>
                  <div class="scroller">
                    <a v-for="token in filteredTokens"
                       :key="token.address"
                       @click="saveToken(token)"
                       :disabled="token.manuallyAdded"
                       class="panel-block is-clearfix is-block">

                      <span class="icon panel-icon is-small"
                            v-html="require('@/img/plus.svg')">
                      </span>
                      <span class="token-symbol">{{token.symbol}}</span>
                      <span class="token-name">{{token.name}}</span>
                    </a>
                  </div>
                </nav>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EndpassService from '@/services/endpass'
import { BigNumber } from 'bignumber.js';
import Balance from '@/components/Balance'
import SearchInput from '@/components/SearchInput.vue'
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      search: '',
      tokens: [],
      serializeInterval: null,
      subscription: null
    }
  },
  computed: {
    ...mapState({
      activeTokens: state => state.tokens.activeTokens,
      prices: state => state.tokens.prices,
      currency: state => state.accounts.settings.fiatCurrency
    }),
    filteredTokens() {
      let unwatchedTokens = this.tokens.filter((token) => {
        return !this.activeTokens.some((activeToken) => {
          return activeToken.address === token.address;
        })
      });
      let search = this.search.toLowerCase()
      if(search === '') {
        return unwatchedTokens
      } else {
        return unwatchedTokens.filter((token) => {
          return token.symbol.toLowerCase().includes(search) ||
            token.name.toLowerCase().includes(this.search)
        });
      }
    }
  },
  methods: {
    ...mapActions('tokens', ['updateTokenPrice']),
    getTokenAmount(token) {
      let balanceBn = new BigNumber(token.balance);
      let decimalsBn = new BigNumber(10).pow(token.decimals);
      return balanceBn.div(decimalsBn); 
    },
    saveToken(token) {
      // Add token to subscription
      this.$set(token, 'manuallyAdded', true);
      this.$store.dispatch('tokens/addTokenToSubscription', token);
    },
    getAllTokens(context) {
      EndpassService.getTokensList()
        .then(resp => {
          this.tokens = resp.data;
        })
        .catch(e => {
          this.$notify({
            title: 'Failed to get list of tokens',
            text:
              'An error occurred while retrieving the list of tokens. Please try again.',
            type: 'is-warning',
          });
          console.error(e);
        });
    },
  },
  created() {
    this.getAllTokens();
  },
  components: {
    SearchInput,
    Balance
  }
}
</script>

<style lang="scss">
.scroller {
  max-height: 500px;
  overflow-y: scroll;
}

.panel {
  .panel-heading {
    background-color: $primary;
    &:first-child {
      border-top: none;
    }
    border: none;
    border-radius: 0;

    color: $white;
    font-weight: 600;
    text-transform: uppercase;
  }

  .panel-block {
    &:first-child {
      border-top: none;
    }

    .field {
      &.is-expanded {
        flex-grow: 1;
      }
    }
  }
}

.token-symbol {
  font-weight: 600;
}
</style>
