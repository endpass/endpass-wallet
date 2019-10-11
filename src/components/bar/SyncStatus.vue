<template>
  <div class="sync-status">
    <span
      :title="message"
      :class="statusClass"
      class="tag"
    >{{
      statusMessage
    }}</span>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'SyncStatus',
  data() {
    return {};
  },
  computed: {
    ...mapState({
      blockNumber: state => state.web3.blockNumber,
      apiStatus: state => state.connectionStatus.isApiConnecting,
    }),
    ...mapGetters('connectionStatus', ['appStatus']),
    statusClass() {
      switch (this.appStatus) {
        case 'failed':
          return 'is-danger';
        case 'syncing':
          return 'is-warning';
        case 'ready':
          return this.apiStatus ? 'is-success' : 'is-warning';
        default:
          return '';
      }
    },
    statusMessage() {
      let message = `${this.appStatus}`;
      if (!this.apiStatus && message === 'ready') {
        message = this.$t('components.syncStatus.apiConnectionError');
      }
      return message;
    },
    message() {
      return this.blockNumber
        ? this.$t('components.syncStatus.syncedToBlock', {
            blockNumber: this.blockNumber,
          })
        : this.$t('components.syncStatus.awaitingBlockNumber');
    },
  },
};
</script>

<style lang="scss">
.sync-status {
  display: inline-block;
  .tag {
    font-weight: 600;
    font-size: 0.9rem;
  }
}
</style>
