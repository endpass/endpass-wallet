<template>
	<div>
		<p class="heading">Block number</p>
		<div class="tags has-addons">
		  <span class="tag">{{blockNumber}}</span>
			<span class="tag is-warning" v-if="showSyncing">Syncing</span>
			<span class="tag is-success" v-else>Synced</span>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex';
export default {
	data() {
		return {

		}
	},
	computed: {
		...mapState({
	  	blockNumber: state => state.web3.blockNumber,
	  	isSyncing: state => state.web3.isSyncing,
	  	account: state => state.accounts.activeAccount,
	  	balance: state => state.accounts.balance
	  }),
		showSyncing() {
			return (this.account && this.balance === null) || this.isSyncing 
		}
	}
}
</script>
<style>
	
</style>