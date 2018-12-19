<template>
  <div class="sync-status">
    <span 
      :title="'synced to block '+ blockNumber" 
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
    ...mapState({
      blockNumber: state => state.web3.blockNumber,
    }),
    ...mapGetters('connectionStatus', ['appStatus']),
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
