<template>
  <div id="app"><div class="navbar">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/">Endpass Wallet</router-link>
      </div>
      <div class="navbar-menu">
        <div class="select">
        <select>
          <option>Main</option>
          <option>Ropsten</option>
        </select>
      </div>
        <div class="navbar-start">
          <router-link class="navbar-item" :to="{name: 'SendPage'}">Send</router-link>
          <router-link class="navbar-item" :to="{name: 'ReceivePage'}">Receive</router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <span>Current Account: </span>
            <span v-if="activeAccount">{{ activeAccount.getAddressString() }}</span>
            <router-link :to="{name: 'NewWallet'}" class="button is-primary" v-else>Create</router-link>
          </div>
          <div class="navbar-item">
            <span>Current Network</span>
          </div>
        </div>

      </div>
    </div>

    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {};
  },
  computed: {
    activeAccount() {
      console.log(this.$store);
      return this.$store.state.activeAccount;
    }
  }
}
</script>

<style lang="scss">
a {
  color: $purple;
  &:hover {
    color: darken($purple, 15%);
  }
}

h1,h2,h3,h4,h5,h6 {
    font-family: $heading-font-family;
}

</style>
