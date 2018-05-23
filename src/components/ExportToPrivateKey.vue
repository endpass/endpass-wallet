<template>
  <div class="export-private-key">
    <h1 class="title">Export Private Key</h1>
    <div v-if="!showPrivateKey">
      <p class="subtitle">Click the button below to display your private key</p>
      <a class="button is-primary" @click="showPrivateKey=true">Show Private
      Key</a>
    </div>
    <div v-else>
      <p class="subtitle">Your private key is below. Do not share it with
      anyone!</p>
      <p class="code">{{privateKey}}</p>
      <p>
        <a class="button is-light" @click="showPrivateKey=false">Close</a>
      </p>
    </div>
  </div>
</template>


<script>
import accounts from '@/mixins/accounts'

export default {
  data () {
    return {
      showPrivateKey: false
    }
  },
  computed: {
    privateKey() {
      return this.activeAccount.getPrivateKeyString();
    }
  },
  mixins: [accounts]
}
</script>
