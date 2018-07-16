<template>
  <div id="app" class="app-container">

    <app-nav class="app-section"></app-nav>
    <info-bar class="app-section"></info-bar>
    <notifications position="top center" width="100%" :speed="500"
                                         :duration="5000" classes="app-notification"/>

    <div class="main app-section">
      <router-view/>
    </div>
  </div>
</template>

<script>
import AppNav from '@/components/AppNav.vue';
import InfoBar from '@/components/bar/InfoBar.vue';
import errorHandler from '@/mixins/errorHandler';

export default {
  name: 'App',
  components: {
    AppNav,
    InfoBar,
  },
  mixins: [errorHandler],
};
</script>

<style lang="scss">
@import './css/buttons.scss';
@import './css/icons.scss';
@import './css/layout.scss';
@import './css/notifications.scss';
@import './css/typography.scss';

.main {
  background: $light-grey;
  height: 100%;
}
</style>
