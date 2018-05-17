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
      tokens: [],
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
    saveToken(token) {
      // Add token to subscription
      this.$store.dispatch('tokens/addTokenToSubscribtion', token);
    },
    getAllTokens(context) {
      EndpassService.getTokensList().then((resp) => {
        this.tokens = resp.data;
      });
    }
  },
  created() {
    this.getAllTokens();
  }
}
</script>

<style lang="css">
.scroller {
  max-height: 500px;
  overflow: scroll;
}
</style>
