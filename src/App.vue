<template>
  <div id="app" class="app-container">

    <div class="columns">
      <div class="column is-narrow no-padding-right">
        <nav-sidebar/>
      </div>
      <div class="column no-padding-left">
        <app-nav class="app-section"></app-nav>
        <info-bar class="app-section"></info-bar>
        <notifications position="top center" width="100%" :speed="500"
                                             :duration="5000" classes="app-notification"/>

        <div class="main app-section">
          <quick-actions/>

          <router-view/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppNav from '@/components/AppNav.vue';
import NavSidebar from '@/components/NavSidebar.vue';
import InfoBar from '@/components/bar/InfoBar.vue';
import QuickActions from '@/components/QuickActions.vue';
import errorHandler from '@/mixins/errorHandler';

export default {
  name: 'App',
  components: {
    AppNav,
    NavSidebar,
    InfoBar,
    QuickActions,
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
