import Web3 from 'web3';
import { infuraConf } from '@/config.js';
import EthBlockTracker from 'eth-block-tracker';
import storage from '@/services/storage';
import { subscribtionsBlockchainInterval } from '@/config'
import { providerFactory } from '@/class';

const activeNet = {
  name: 'Main',
  id: 1,
  networkType: 'main',
  url: `https://mainnet.infura.io/${infuraConf.key}`,
};

const provider = providerFactory(activeNet.url);
const web3 = new Web3(provider);

export default {
  namespaced: true,
  state() {
    return {
      web3,
      defaultNetworks: [
        {
          id: 1,
          networkType: 'main',
          name: 'Main',
          url: `https://mainnet.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Ropsten',
          networkType: 'ropsten',
          id: 3,
          url: `https://ropsten.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Rinkeby',
          networkType: 'rinkeby',
          id: 4,
          url: `https://rinkeby.infura.io/${infuraConf.key}`,
        },
      ],
      storedNetworks: [],
      isSyncing: false,
      blockNumber: 0,
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
      const provider = providerFactory(state.activeNet.url)
      if (state.web3 && state.web3.setProvider) {
        if (state.web3.currentProvider.destroy) {
          state.web3.currentProvider.destroy()
        }

        state.web3.setProvider(provider);
      } else {
        state.web3 = new Web3(provider);
      }
    },
    addNewProvider(state, network) {
      state.storedNetworks.push(network);
      storage.write('networks', state.storedNetworks);
    },
    setProviders(state, networks) {
      state.storedNetworks = networks;
    },
    setSyncStatus(state, syncObject) {
      state.isSyncing = syncObject;
    },
    setBlockNumber(state, number) {
      state.blockNumber = number;
    },
    setNetworkType(state, type) {
      state.activeNet.networkType = type;
    },
  },
  actions: {
    changeNetwork({ commit, dispatch, getters }, networkId) {
      const netIndex = getters.networks.findIndex(net => net.id === networkId);
      const network = getters.networks[netIndex];
      commit('changeNetwork', network);
      storage.write('net', network.id);
      return Promise.all([
        dispatch('fetchNetworkType'),
        dispatch('subscribeOnBlockUpdates'),
        dispatch('tokens/subscribeOnTokenUpdates',{}, {root: true})
      ]);
    },
    addNewProvider({ commit, dispatch, getters }, network) {
      network.id = getters.networks.reduce((max, next) => {
        return max.id > next.id ? max : next;
      }).id + 1;
      commit('addNewProvider', network);
      return dispatch('changeNetwork', network.id);
    },
    subscribeOnSyncStatus(context) {
      let providerCache = context.state.web3.currentProvider;
      let promise = context.state.web3.eth.isSyncing();
      promise.then(resp => {
        if (providerCache === context.state.web3.currentProvider) {
          context.commit('setSyncStatus', resp);
          setTimeout(()=> {
            context.dispatch('subscribeOnSyncStatus')
          }, subscribtionsBlockchainInterval);
        } else {
          context.dispatch('subscribeOnSyncStatus')
        }
      });
      return promise;
    },
    fetchNetworkType(context) {
      // network type already set, return resolved promise
      if (context.state.activeNet.networkType) {
        return Promise.resolve();
      }
      let promise = context.state.web3.eth.net.getNetworkType();
      promise.then(resp => {
        context.commit('setNetworkType', resp);
      });
      return promise;
    },
    subscribeOnBlockUpdates(context) {
      if (context.state.blockSubscribtion) {
        context.state.blockSubscribtion.stop();
      }
      context.state.blockSubscribtion = new EthBlockTracker({
        provider: context.state.web3.currentProvider,
        pollingInterval:subscribtionsBlockchainInterval
      });
      context.state.blockSubscribtion.on('latest', block => {
        if (context.rootState.accounts.activeAccount) {
          context.dispatch('accounts/updateBalance', {}, { root: true });
        }
        context.commit(
          'setBlockNumber',
          web3.utils.hexToNumberString(block.number)
        );
      });
      context.state.blockSubscribtion.start();
    },
    init({ commit, dispatch, state }) {
      return storage
        .read('net')
        .then(cachedNet => parseInt(cachedNet))
        .then(cachedNet =>
          Promise.all([
            storage.read('networks').then(net => (net ? net : [])),
            cachedNet ? cachedNet : 1,
          ])
        )
        .then(([storedNetworks, cachedNet]) => {
          const activeNet =
            state.defaultNetworks.find(net => net.id === cachedNet) ||
            storedNetworks.find(net => net.id === cachedNet);

          commit('setProviders', storedNetworks || []);
          commit('changeNetwork', activeNet);
          dispatch('subscribeOnSyncStatus');
          dispatch('subscribeOnBlockUpdates');
        })
        .catch(e => console.error(e));
    },
  },
};
