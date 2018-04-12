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
            <span v-if="accounts.length">{{ accounts[selectedAccountId].getAddressString() }}</span>
            <router-link :to="{name: 'NewWallet'}" class="button is-primary" v-else>Create</router-link>
          </div>
          <div class="navbar-item">
            <span>Current Network</span>
          </div>
        </div>

      </div>
    </div>

    <keep-alive>
      <router-view :accounts="accounts"
               @add-account="addAccount"
        />
    </keep-alive>
  </div>
</template>

<script>

import Web3 from 'web3';

export default {
  name: 'App',
  data () {
    let web3
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(Web3.givenProvider);
    } else {
      web3 = new Web3('http://localhost:8545');
    };
    return {
      web3
    }
  },
  methods: {
    // Add a new account to the accounts list
    addAccount(account) {
      this.accounts.push(account)
      this.selectedAccountId = this.accounts.length - 1
    },
    // Switch to the specific account
    selectAccount(id) {
      this.selectedAccountId = id
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
