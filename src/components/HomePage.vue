<template>
  <div class="section">
    <div class="container">
      <h1 class="title">Endpass Wallet</h1>
      <div class="accounts">

        <div v-if="accounts.length">
        </div>
        <div v-else>
          <p>Get started by generating or importing an Ethereum Wallet</p>
          <router-link :to="{name: 'NewWallet'}" class="button is-primary">Create Wallet</router-link>
          <p>Or <router-link :to="{name: 'ImportWallet'}">import an existing wallet</router-link></p>
        </div>

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
  props: ['accounts'],
}
</script>

<style lang="scss">
</style>
