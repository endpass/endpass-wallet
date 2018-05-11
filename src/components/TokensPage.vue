<template lang="html">
  <div class="columns">
    <div class="column is-half">
      <nav class="panel">
        <p class="panel-heading">
          Tokens
        </p>
        <div class="panel-block">
          <p class="control has-icons-left">
            <input v-model="search" class="input is-small" type="text" placeholder="search">
            <span class="icon is-small is-left">
              <i class="fas fa-search" aria-hidden="true"></i>
            </span>
          </p>
        </div>
        <div class="scroller">
          <a v-for="token in filteredTokens" class="panel-block is-clearfix is-block">
            <span class="panel-icon">
              <i class="fas fa-book" aria-hidden="true"></i>
            </span>
            {{token.symbol}}
            <span class="is-pulled-right" v-if="token.balance">{{token.balance}}</span>
            <a v-else @click="saveToken(token)" class="button is-pulled-right" type="button" name="button">Show</a>
          </a>
        </div>
        <div class="panel-block">
          <a class="button is-link is-outlined is-fullwidth">
            reset all filters
          </a>
        </div>
      </nav>
    </div>
    <div class="column is-half">
      <nav class="panel">
        <p class="panel-heading">
          Watched tokens
        </p>
        <div class="panel-block">
          <p class="control has-icons-left">
            <input v-model="search" class="input is-small" type="text" placeholder="search">
            <span class="icon is-small is-left">
              <i class="fas fa-search" aria-hidden="true"></i>
            </span>
          </p>
        </div>
        <div class="scroller">
          <a v-for="token in activeTokens" class="panel-block is-clearfix is-block">
            <span class="panel-icon">
              <i class="fas fa-book" aria-hidden="true"></i>
            </span>
            {{token.symbol}}
            <span class="is-pulled-right">{{token.string}}</span>
          </a>
        </div>
        <div class="panel-block">
          <a class="button is-link is-outlined is-fullwidth">
            reset all filters
          </a>
        </div>
      </nav>
    </div>
  </div>

</template>

<script>
import EthplorerService from '@/services/ethplorer'
import EndpassService from '@/services/endpass'

export default {
  data() {
    return {
      search: '',
      serializeInterval: null,
      subscription: null
    }
  },
  computed: {
    activeTokens() {
      return this.$store.state.tokens.activeTokens
    },
    filteredTokens() {
      let unwatchedTokens = this.tokens.filter((token) => {
        return !this.activeTokens.some((activeToken) => {
          return activeToken.address === token.address;
        })
      });
      if(this.search === '')
        return unwatchedTokens
      else
        return unwatchedTokens.filter((token) => {
          return token.symbol.includes(this.search) || token.name.includes(this.search)
        });
    }
  },
  methods: {
    saveToken(address) {
      this.subscription.add({
        address
      })
      this.$store.commit('tokens/saveTokenToWatchStorage', token.address);
    },
    createSubscribtion() {
      let address = this.$store.state.accounts.activeAccount.getAddressString();
      let tokensToWatch = this.$store.state.tokens.getters.tokensToWatch;
      this.subscription = new TokenTracker({
        userAddress: address,
        provider: this.$store.state.web3.web3.currentProvider,
        pollingInterval: 4000,
        tokens: tokensToWatch
      });
      this.serializeInterval = setInterval(()=> {
        let balances = this.subscription.serialize();
        if (typeof balances[0].symbol !== 'undefined')
          this.$store.state.commit('tokens/saveTokens', balances);
      }, 4000);
    },
    destroySubscription() {
      this.subscription.stop();
      clearInterval(this.serializeInterval);
    },
    getNonZeroTokens(context) {
      return new Promise((res, rej) => {
        let address = this.$store.state.accounts.activeAccount.getAddressString();
        EthplorerService.getTransactions().then((resp)=> {
          this.$store.state.commit('tokens/saveTokens', resp.body.tokens);
          res()
        });
      });
    },
    getAllTokens(context) {
      return new Promise((res, rej) => {
        EndpassService.getTokensList().then((tokens) => {
          this.tokens = tokens;
          res();
        });
      });
    }
  },
  created() {
    this.getAllTokens();
    this.getNonZeroTokens().then(this.createSubscribtion);
  },
  destroyed() {
    this.destroySubscription();
  }
}
</script>

<style lang="css">
.scroller {
  max-height: 500px;
  overflow: scroll;
}
</style>
