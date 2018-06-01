import Web3 from 'web3';
import { infuraConf } from '@/config.js';
import { readFromStorage, saveToStorage } from '@/services/storage';

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send;
export default {
  namespaced: true,
  state() {
    const activeNet = {
      name: 'Main',
      id: 1,
      url: `https://mainnet.infura.io/${infuraConf.key}`,
    };

    return {
      web3: new Web3(activeNet.url),
      defaultNetworks: [
        {
          name: 'Main',
          id: 1,
          url: `https://mainnet.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Ropsten',
          id: 2,
          url: `https://ropsten.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Rinkeby',
          id: 3,
          url: `https://rinkeby.infura.io/${infuraConf.key}`,
        },
      ],
      storedNetworks: [],
      activeNet,
    };
  },
  getters: {
    networks(state) {
      return state.defaultNetworks.concat(state.storedNetworks);
    },
  },
  mutations: {
    changeNetwork(state, network) {
      state.activeNet = network;
      if (state.web3) {
        state.web3.setProvider(state.activeNet.url);
      } else {
        state.web3 = new Web3(state.activeNet.url);
      }
    },
    addNewProvider(state, network) {
      state.storedNetworks.push(network);
      saveToStorage('networks', state.storedNetworks);
    },
    setProviders(state, networks) {
      state.storedNetworks = networks;
    },
  },
  actions: {
    changeNetwork(context, networkId) {
      let netIndex = context.getters.networks.findIndex(
        net => net.id === networkId
      );
      let network = context.getters.networks[netIndex];
      context.commit('changeNetwork', network);
      context.dispatch(
        'accounts/subscribeOnBalanceUpdates',
        {},
        { root: true }
      );
      context.dispatch('tokens/subscribeOnTokenUpdates', {}, { root: true });
      saveToStorage('net', network.id);
    },
    addNewProvider(context, network) {
      network.id = context.getters.networks.length + 1;
      context.commit('addNewProvider', network);
      context.dispatch('changeNetwork', network.id);
    },
    init({ commit, state }) {
      return readFromStorage('net')
        .then(cachedNet => parseInt(cachedNet))
        .then(cachedNet =>
          Promise.all([
            readFromStorage('networks').then(net => (net ? net : [])),
            cachedNet ? cachedNet : 1,
          ])
        )
        .then(([storedNetworks, cachedNet]) => {
          const activeNet =
            state.defaultNetworks.find(net => net.id === cachedNet) ||
            storedNetworks.find(net => net.id === cachedNet);

          commit('setProviders', storedNetworks || []);
          commit('changeNetwork', activeNet);
        })
        .catch(e => console.error(e));
    },
  },
};
