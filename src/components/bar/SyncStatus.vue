<template>
  <div class="sync-status">
    <span class="tag" :class="'is-'+appStatus">{{blockNumber}}</span>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
export default {
  data() {
    return {};
  },
  computed: {
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
