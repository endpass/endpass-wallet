<template>
  <div class="sync-status">
    <span
      :title="message"
      :class="statusClass"
      class="tag"
    >{{ appStatus }}</span>
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
    }),
    ...mapGetters('connectionStatus', ['appStatus']),
    statusClass() {
      switch (this.appStatus) {
        case 'failed':
          return 'is-danger';
        case 'syncing':
          return 'is-warning';
        case 'ready':
          return 'is-success';
        default:
          return '';
      }
    },
    message() {
      return this.blockNumber
        ? `Synced to block ${this.blockNumber}`
        : 'Awaiting block number';
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
