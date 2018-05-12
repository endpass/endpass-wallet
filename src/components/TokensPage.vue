<template lang="html">
  <div class="tokens-page">
    <div class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-half">
            <nav class="panel">
              <p class="panel-heading">
              Watched tokens
              </p>
              <div class="panel-block">
                <search-input v-model="search"></search-input>
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
            </nav>
          </div>
          <div class="column is-half">
            <nav class="panel">
              <p class="panel-heading">
              Add Token
              </p>
              <div class="panel-block">
                <search-input v-model="search"></search-input>
              </div>
              <div class="scroller">
                <a v-for="token in filteredTokens" class="panel-block is-clearfix is-block">
                  <span class="panel-icon">
                    <i class="fas fa-book" aria-hidden="true"></i>
                  </span>
                  {{token.symbol}}
                  <span class="is-pulled-right" v-if="token.balance">{{token.balance}}</span>
                  <a v-else @click="saveToken(token)" class="button
                    is-primary is-pulled-right">
                    <span class="icon is-small"
                          v-html="require('@/img/plus.svg')">
                    </span>
                    Add
                  </a>
                </a>
              </div>
            </nav>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EthplorerService from '@/services/ethplorer'
import EndpassService from '@/services/endpass'
import SearchInput from '@/components/SearchInput.vue'

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
    saveToken(address) {
      this.$store.dispatch('tokens/saveTokenToWatchStorage', token.address);
    },
    getAllTokens(context) {
      EndpassService.getTokensList().then((resp) => {
        this.tokens = resp.data;
      });
    }
  },
  created() {
    this.getAllTokens();
  },
  components: {
    SearchInput
  }
}
</script>

<style lang="css">
.scroller {
  max-height: 500px;
  overflow: scroll;
}
</style>
