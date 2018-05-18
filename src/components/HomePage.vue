<template>
      <div class="home-page">
        <div class="section" v-if="activeAccount">
          <div class="container">
            <h1 class="title">Your Endpass Wallet</h1>
            <div class="address box">
              <div class="columns">
                <div class="column">
                  <p class="heading">Ethereum Address</p>
                  <p
                     class="code address">{{activeAccount.getAddressString()}}</p>
                </div>
                <div class="column">
                  <p class="heading">Balance</p>
                  <p>
                    <span class="stat title">{{balance}}</span>
                    <span class="has-text-centered">ETH</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section" v-else>
          <div class="container has-text-centered">
            <h1 class="title">Welcome</h1>
            <p class="subtitle">Get started by generating or importing an
            Ethereum wallet.</p>
            <div class="buttons is-centered">
              <router-link :to="{name: 'NewWallet'}" class="button
              is-primary is-medium">Create New Wallet</router-link>
              <router-link :to="{name: 'ImportWallet'}" class="button
            is-light is-medium">Import an existing wallet</router-link>
            </div>
          </div>
        </div>
        <div class="section" v-if="activeAccount">
          <export-to-json></export-to-json>
        </div>
      </div>
</template>

<script>
import ExportToJson from '@/components/ExportToJson.vue'
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
  },
  components: {
    ExportToJson
  }
}
</script>

<style lang="scss">
</style>
