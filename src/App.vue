<template>
  <div id="app">
    <div class="app-top">

      <app-nav :active-account="!!activeAccount"></app-nav>
      <info-bar></info-bar>
      <notifications position="top center" width="100%" :duration="-1"/>
    </div>

    <div class="main">
      <router-view/>
    </div>
  </div>
</template>

<script>
import AppNav from '@/components/AppNav.vue'
import InfoBar from '@/components/InfoBar.vue'
import accounts from '@/mixins/accounts'

export default {
  name: 'App',
  data () {
    return {
    }
  },
  components: {
    AppNav,
    InfoBar
  },
  mixins: [accounts]
}
</script>

<style lang="scss">
@import './css/buttons.scss';
@import './css/icons.scss';
@import './css/layout.scss';
@import './css/typography.scss';

</style>
