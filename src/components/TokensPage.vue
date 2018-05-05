<template lang="html">
  <nav class="panel">
  <p class="panel-heading">
    Tokens
  </p>
  <div class="panel-block">
    <p class="control has-icons-left">
      <input class="input is-small" type="text" placeholder="search">
      <span class="icon is-small is-left">
        <i class="fas fa-search" aria-hidden="true"></i>
      </span>
    </p>
  </div>
  <!-- <p class="panel-tabs">
    <a class="is-active">all</a>
    <a>public</a>
    <a>private</a>
    <a>sources</a>
    <a>forks</a>
  </p> -->
  <div class="scroller">
    <a v-for="token in tokens" class="panel-block is-clearfix is-block">
      <span class="panel-icon">
        <i class="fas fa-book" aria-hidden="true"></i>
      </span>
      {{token.symbol}}
      <span class="is-pulled-right" v-if="token.balance">{{token.balance}}</span>
      <button v-else @click="saveToken(token)" class="button is-pulled-right" type="button" name="button">Show</button>
    </a>
  </div>
  <div class="panel-block">
    <button class="button is-link is-outlined is-fullwidth">
      reset all filters
    </button>
  </div>
</nav>
</template>

<script>
export default {
  data() {
    return {
      tokens: []
    }
  },
  created() {

    this.$store.dispatch('tokens/createSubscribtion');
    this.$http.get(`https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/tokens/tokens-eth.json`)
      .then(response => {
      this.tokens = response.body.map((token)=> {
        token.balance = null;
        return token
      });
      this.setBalances();
    }, response => {
    });
    this.$store.state.tokens.subscription.on('update', this.setBalances)
  },
  methods: {
    saveToken(token) {
      this.$store.dispatch('tokens/subscribeOnTokenUpdates', token.address, token);
      this.setBalances();
    },
    setBalances() {
      this.tokens.forEach((token)=>{
        let balance = null;
        console.log(this.$store.state.tokens.activeTokens)
        let newToken = this.$store.state.tokens.activeTokens.find((balance) => {
          if(balance.address === token.address)
            token.balance = balance.balance;
        });
      })
    }
  }
}
</script>

<style lang="css">
.scroller {
  max-height: 500px;
  overflow: scroll;
}
</style>
