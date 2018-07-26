<template>
  <div id="app" class="app-container">

    <header class="app-header">
      <app-nav class="app-section"></app-nav>
    </header>

    <aside class="app-sidebar">
      <nav-sidebar/>
    </aside>

    <main class="app-content">
        <div class="">
          <info-bar class="app-section"></info-bar>
          <notifications position="top center" width="100%" :speed="500"
                                               :duration="5000" classes="app-notification"/>

          <div class="main app-content app-section">

            <router-view/>
          </div>
        </div>
    </main>

    <footer class="app-footer">
      <quick-actions class="is-hidden-desktop"/>
      <div class="footer-inner container is-hidden-touch">
        <p class="small">&copy; 2018 Endpass, Inc</p>
      </div>
    </footer>
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
