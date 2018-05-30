<template>
      <div class="home-page app-page">
        <div class="section" v-if="activeAccount">
          <div class="container">
            <div class="card app-card">
              <div class="card-header">
              </div>
              <div class="card-content">
                <h1 class="card-header-title">Your Endpass Wallet</h1>
                <div class="address box">
                  <div class="columns">
                    <div class="column">
                      <p class="heading">Ethereum Address</p>
                      <p
                         class="code address">{{address}}</p>
                    </div>
                    <div class="column">
                      <p class="heading">Balance</p>
                      <p>
                      <span class="stat title">{{balance}}</span>
                      <span class="has-text-centered">ETH</span>
                      </p>
                    </div>
                    <div class="column" v-if="isPrivateKey">
                      <p class="heading">Actions</p>
                      <router-link :to="{name: 'ExportWallet'}">
                        <span class="icon is-small"
                              v-html="require('@/img/arrow-thick-bottom.svg')"></span>Export
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section" v-else>
          <div class="container has-text-centered">
            <div class="card app-card main-app-card">
            <div class="card-content">
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
          </div>
        </div>

      </div>
</template>

<script>
import accounts from '@/mixins/accounts'

export default {
  data () {
    return {
    }
  },
  computed: {
    isPrivateKey() {
      return this.$store.state.accounts.activeAccount && this.$store.state.accounts.activeAccount._privKey !== null
    }
  },
  mixins: [accounts]
}
</script>

<style lang="scss">
</style>
