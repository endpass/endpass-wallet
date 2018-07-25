<template>
	<div>
		<p class="heading">Block</p>
		<div class="tags has-addons">
		  <span class="tag">{{blockNumber}}</span>
			<span class="tag" :class="'is-'+appStatus"></span>
		</div>
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
<style>
</style>
