import Web3 from 'web3';
import { infuraConf } from '@/config.js'
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
export default {
  namespaced: true,
  state() {
    let cachedNet = parseInt(localStorage.getItem('net'));
    if(!cachedNet) {
      cachedNet = 1;
    }
    let storedNetworks = JSON.parse(localStorage.getItem('networks') || '[]');
    let defaultNetworks = [{
        name: 'Main',
        id:1,
        url: `https://mainnet.infura.io/${infuraConf.key}`
      },{
        name: 'Ropsten',
        id:2,
        url: `https://ropsten.infura.io/${infuraConf.key}`
      },{
        name: 'Rinkeby',
        id:3,
        url: `https://rinkeby.infura.io/${infuraConf.key}`
    }];
    let activeNet = defaultNetworks.find(net => net.id === cachedNet) ||
    storedNetworks.find(net => net.id === cachedNet);
    return {
      web3: new Web3(activeNet.url),
      defaultNetworks,
      storedNetworks,
      activeNet
    }
  },
  getters: {
    networks(state) {
      return state.defaultNetworks.concat(state.storedNetworks);
    }
  },
  mutations: {
    changeNetwork(state, network) {
      state.activeNet = network;
      if(state.web3) {
        state.web3.setProvider(state.activeNet.url);
      } else {
        state.web3 = new Web3(state.activeNet.url);
      }
    },
    addNewProvider(state, network) {
      state.storedNetworks.push(network);
      localStorage.setItem('networks',JSON.stringify(state.storedNetworks));
    }
  },
  actions: {
    changeNetwork(context, networkId) {
      let netIndex = context.getters.networks.findIndex(net => net.id === networkId);
      let network = context.getters.networks[netIndex];
      context.commit('changeNetwork', network);
      context.dispatch('accounts/subscribeOnBalanceUpdates',{}, {root: true});
      context.dispatch('tokens/subscribeOnTokenUpdates',{}, {root: true});
      localStorage.setItem('net', network.id);
    },
    addNewProvider(context, network) {
      network.id = context.getters.networks.length + 1;
      context.commit('addNewProvider', network);
      context.dispatch('changeNetwork', network.id);
    }
  }
}
