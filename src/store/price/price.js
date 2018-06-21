import priceService from '@/services/price'
import { subscribtionsAPIInterval } from '@/config'

export default {
  namespaced: true,
	state: {
		price: null,
		updated: null
	},
	mutations: {
		setPrice(state, price) {
			state.price = price;
		},
		setUpdateTime(state, updateTime) {
			state.updateTime = updateTime;
		}
	},
	actions: {
	  updatePrice(context) {
      let price = priceService.getEthPrice(context.rootState.accounts.settings.fiatCurrency);
      price.then((resp) => {
        context.commit('setPrice', resp[context.rootState.accounts.settings.fiatCurrency]);
        context.commit('setUpdateTime', new Date().time);
      }).catch(e => {
        console.error(e, 'bal');
      });
      return price
	  },
	  subsctibeOnPriceUpdates(context) {
	  	setInterval(()=>{
	  		context.dispatch('updatePrice')
	  	}, subscribtionsAPIInterval);
	  },
		init({ dispatch }) {
	    	return dispatch("subsctibeOnPriceUpdates");
	    },
		}
}
