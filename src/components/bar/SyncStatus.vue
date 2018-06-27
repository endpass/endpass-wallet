<template>
	<div>
		<p class="heading">Block number</p>
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
		return {

		}
	},
	computed: {
		...mapState({
	  	blockNumber: state => state.web3.blockNumber,
	  	account: state => state.accounts.activeAccount,
	  	balance: state => state.accounts.balance
	  }),
		...mapGetters('connectionStatus', [
			'appStatus'
		])
	}
}
</script>
<style>

</style>
