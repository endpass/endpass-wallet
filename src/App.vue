<template>
  <div id="app" class="app-container">

    <header class="app-header">
      <info-bar class="app-section"></info-bar>
    </header>

    <nav class="app-nav">
      <nav-sidebar/>
    </nav>

    <main class="app-content">
        <div class="">
          <notifications position="top center" width="100%" :speed="500"
                                               :duration="5000" classes="app-notification"/>

          <div class="main app-content app-section">

            <router-view/>
          </div>
        </div>
    </main>

    <quick-actions class="is-hidden-desktop"/>
    <app-footer class="is-hidden-touch"/>
    <page-loader />
  </div>
</template>

<script>
import NavSidebar from '@/components/NavSidebar.vue';
import InfoBar from '@/components/bar/InfoBar.vue';
import QuickActions from '@/components/QuickActions.vue';
import errorHandler from '@/mixins/errorHandler';
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter.vue';

export default {
  name: 'App',
  components: {
    NavSidebar,
    InfoBar,
    QuickActions,
    PageLoader,
    AppFooter,
  },
  mixins: [errorHandler],
  created() {
    this.$store.dispatch('init');
  },
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
