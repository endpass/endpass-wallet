<template>
  <div 
    id="app" 
    class="app-container"
  >
    <header class="app-header">
      <info-bar class="app-section"/>
    </header>

    <nav class="app-nav">
      <nav-sidebar/>
    </nav>

    <main class="app-content">
      <div class>
        <notifications
          :speed="500"
          :duration="5000"
          position="top center"
          width="100%"
          data-test="app-notification"
          classes="app-notification"
        />

        <div class="main app-content app-section">
          <router-view/>
        </div>
      </div>
    </main>

    <quick-actions class="is-hidden-desktop"/>
    <app-footer class="is-hidden-touch"/>
    <page-loader/>
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

  created() {
    this.$store.dispatch('init');
  },

  mounted() {
    this.$intercom.boot();
    // TODO configure and enable
    // this.$intercom.show();
  },

  mixins: [errorHandler],

  components: {
    NavSidebar,
    InfoBar,
    QuickActions,
    PageLoader,
    AppFooter,
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
