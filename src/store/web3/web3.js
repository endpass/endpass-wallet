import Web3 from 'web3';
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
export default {
  namespaced: true,
  state: {
    web3: null,
    networks: [{
      name: 'Main',
      url: 'https://mainnet.infura.io/zU4GTAQ0LjJNKddbyztc '
    },{
      name: 'Ropsten',
      url: 'https://ropsten.infura.io/zU4GTAQ0LjJNKddbyztc '
    },{
      name: 'Rinkeby',
      url: 'https://rinkeby.infura.io/zU4GTAQ0LjJNKddbyztc '
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
