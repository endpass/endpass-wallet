<template>
  <div class="quick-actions container">
    <div class="level is-mobile" v-if="address">
      <div class="level-left">
        <router-link
           v-if="wallet"
           class="level-item button"
           :to="{name: 'SendPage'}">
          <span class="icon is-small"
                v-html="require('@/img/arrow-thick-left.svg')"></span>Send
        </router-link>
        <router-link class="level-item button" :to="{name:
        'ReceivePage'}">
          <span class="icon is-small"
                v-html="require('@/img/arrow-thick-right.svg')"></span>Receive
        </router-link>
      </div>
      <div class="level-right">
        <router-link class="level-item button" :to="{name: 'HistoryPage'}">
          <span class="icon is-small"
                v-html="require('@/img/clock.svg')"></span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
  },
}
</script>

<style lang="scss">
.quick-actions {
  padding: 1rem 1.5rem 0;
}
</style>
