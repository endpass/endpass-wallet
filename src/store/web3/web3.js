import Web3 from 'web3';
import { infuraConf } from '@/config.js'
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
export default {
  namespaced: true,
  state: {
    web3: null,
    networks: [{
      name: 'Main',
      url: `https://mainnet.infura.io/${infuraConf.key}`
    },{
      name: 'Ropsten',
      url: `https://ropsten.infura.io/${infuraConf.key}`
    },{
      name: 'Rinkeby',
      url: `https://rinkeby.infura.io/${infuraConf.key}`
    }],
    activeNet: null
  },
  mutations: {
    changeNetwork(state, network) {
      state.activeNet = network;
      if(state.web3) {
        state.web3.setProvider(state.activeNet.url);
      } else {
        state.web3 = new Web3(state.activeNet.url);
      }
    }
  },
  actions: {
    changeNetwork(context, networkName) {
      let netIndex = context.state.networks.findIndex(net => net.name === networkName);
      let network = context.state.networks[netIndex];
      context.commit('changeNetwork', network);
      context.dispatch('accounts/subscribeOnBalanceUpdates',{}, {root: true});
      context.dispatch('tokens/subscribeOnTokenUpdates',{}, {root: true});
    }
  }
}
