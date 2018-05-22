<template>
  <div id="app">
    <div class="app-top">

      <app-nav :active-account="!!activeAccount"></app-nav>
      <info-bar></info-bar>


    </div>

     <!-- <flash-message inline-template>
       <div class="notifications is-overlay">
         <transition-group name="fade" tag="div" class="container">
           <div v-for="(message, index) in storage" :key="index"
                class="notification" :class="'is-' + message.type" >
                <button class="delete"
                        @click.stop.prevent="destroyFlash(index)"></button>
                {{ message.content }}
           </div>
         </transition-group>
       </div>
     </flash-message> -->
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
