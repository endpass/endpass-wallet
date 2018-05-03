<template>
      <div class="home-page">
        <div class="section" v-if="activeAccount">
          <div class="container">
            <h1 class="title">Your Endpass Wallet</h1>
            <div class="address box">
              <div class="level">
                <div class="level-item is-inline-flex">
                  <div>
                    <p class="heading">Ethereum Address</p>
                    <p
                       class="is-size-4">{{activeAccount.getAddressString()}}</p>
                  </div>
                </div>
                <div class="level-item">
                  <div class="div">
                    <p class="heading">Balance</p>
                    <p class="stat title">{{balance}}</p>
                    <p class="has-text-centered">ETH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section" v-else>
          <div class="container">
            <p>Get started by generating or importing an Ethereum Wallet</p>
            <router-link :to="{name: 'NewWallet'}" class="button is-primary">Create Wallet</router-link>
            <p>Or</p>
            <router-link :to="{name: 'ImportWallet'}" class="button is-primary">Import an existing wallet</router-link>
          </div>
        </div>

      </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  computed: {
    activeAccount() {
      return this.$store.state.accounts.activeAccount;
    },
    balance() {
      return this.$store.state.accounts.balance === null ? null : web3.utils.fromWei(this.$store.state.accounts.balance);
    }
  }
}
</script>

<style lang="scss">
</style>
