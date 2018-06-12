<template>
	<div>
    <p class="heading">Balance</p>
    <span class="title">{{ balance }}</span>
    {{currency}}
    <a v-if="hasUpload" @click.prevent="update()">
    	<span class="icon is-small"
                v-html="require('@/img/reload.svg')"></span>
    </a>
	</div>
</template>
<script>
	import {BigNumber} from 'bignumber.js';
	export default {
		props: {
			amount: {
			},
			price: {
				default: 1
			},
			currency: {
				type: String,
				default: 'ETH'
			},
			decimals: {
				default: null
			}
		},
		computed: {
			balance() {
				let amountBn
				if(!BigNumber.isBigNumber(this.amount)){
				 amountBn = new BigNumber(this.amount)
				} else {
					amountBn = this.amount;
				}
				let priceBn
				if(!BigNumber.isBigNumber(this.price)){
				 priceBn = new BigNumber(this.price)
				} else {
					priceBn = this.price;
				}

				let balance = amountBn.times(priceBn);
				if(this.decimals){
					return balance.toFixed(this.decimals);
				} else {
					return balance.toFixed()
				}
			},
			hasUpload() {
				return this.$listeners.update
			}
		},
		methods: {
			update() {
				this.$emit('update')
			}
		}
	}
</script>
<style>
	
</style>