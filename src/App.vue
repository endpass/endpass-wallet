<template>
  <div id="app" class="app-container">

    <app-nav class="app-section" :active-account="!!activeAccount"></app-nav>
    <info-bar class="app-section"></info-bar>
    <notifications position="top center" width="100%" :speed="500"
                                         :duration="5000" classes="app-notification"/>

    <div class="main app-section">
      <router-view/>
    </div>
  </div>
</template>

<script>
import AppNav from '@/components/AppNav.vue'
import InfoBar from '@/components/bar/InfoBar.vue'
import accounts from '@/mixins/accounts'
import { mapState } from 'vuex'
import { NotificationError } from '@/class';

export default {
  name: 'App',
  computed: {
    ...mapState('errors', {
      errorEmitter: state => state.errorEmitter,
    }),
  },
  methods: {
    handleError(err) {
      if (err instanceof NotificationError) {
        const { title, text, type } = err;
        this.$notify({ title, text, type });
      } else {
        console.error(err);
      }
    }
  },
  mounted() {
    this.errorEmitter.on('error', this.handleError);
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
@import './css/notifications.scss';
@import './css/typography.scss';

.main {
  background: $light-grey;
  height: 100%;
}

</style>
