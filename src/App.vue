<template>
  <div
    id="app"
    class="app-container"
  >
    <header class="app-header">
      <info-bar class="app-section" />
    </header>

    <nav class="app-nav">
      <nav-sidebar />
    </nav>

    <main class="app-content">
      <div class>
        <div class="notify-container">
          <notifications
            :speed="500"
            :duration="5000"
            width="auto"
            position="top center"
            data-test="app-notification"
            classes="notification app-notification"
          />
          <notifications
            group="persistent"
            :speed="500"
            :duration="-1"
            :close-on-click="false"
            width="auto"
            position="top center"
            data-test="app-notification"
            classes="notification app-notification app-notification-persist"
          />
        </div>

        <div class="main app-content app-section">
          <router-view />
        </div>
      </div>
    </main>

    <quick-actions class="is-hidden-desktop" />
    <app-footer class="is-hidden-touch" />
    <v-page-loader :is-loading="isLoading" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import NavSidebar from '@/components/NavSidebar';
import InfoBar from '@/components/bar/InfoBar';
import QuickActions from '@/components/QuickActions';
import errorHandler from '@/mixins/errorHandler';
import AppFooter from '@/components/AppFooter';

export default {
  name: 'App',

  computed: {
    ...mapState({
      isLoading: state => state.isPageLoading,
    }),
  },

  methods: {
    initMode() {
      const lines = (window.location.search || '').slice(1).split('&');
      const query = lines.reduce((map, line) => {
        const values = line.split('=');
        const key = values[0];
        // eslint-disable-next-line
        map[key] = values[1];
        return map;
      }, {});

      const initModeParams = {
        type: query.mode,
        serverUrl: query.serverUrl,
      };

      this.$store.dispatch('init', initModeParams.type ? initModeParams : null);
    },
  },

  created() {
    this.initMode();
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
@import './css/badge.scss';

.main {
  background: $light-grey;
  height: 100%;
}
</style>
