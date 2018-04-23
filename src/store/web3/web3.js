import Web3 from 'web3';

export default {
  namespaced: true,
  state: {
    web3: null,
    networks: [{
      name: 'Main',
      url: 'wss://mainnet.infura.io/ws'
    },{
      name: 'Ropsten',
      url: 'ws://127.0.0.1:8584'
    },{
      name: 'Rinkeby',
      url: 'wss://rinkeby.infura.io/ws'
    }],
    activeNet: null
  },
  mutations: {
    changeNetwork(state, networkName) {
      let netIndex = state.networks.findIndex(net => net.name === networkName);
      state.activeNet = state.networks[netIndex];
      if(state.web3) {
        state.web3.setProvider(state.activeNet.url);
      } else {
        state.web3 = new Web3(state.activeNet.url);
      }
      console.log(state.web3.currentProvider);
    }
  }
}
