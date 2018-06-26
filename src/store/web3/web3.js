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
      const provider = providerFactory(state.activeNet.url);
      if (state.web3 && state.web3.setProvider) {
        if (state.web3.currentProvider.destroy) {
          state.web3.currentProvider.destroy();
        }

        state.web3.setProvider(provider);
      } else {
        state.web3 = new Web3(provider);
      }
    },
    addNewProvider(state, network) {
      state.storedNetworks.push(network);
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
      const network = getters.networks.find(net => net.id === networkId);
      commit('changeNetwork', network);

      return Promise.all([
        storage.write('net', network.id),
        dispatch('fetchNetworkType'),
        dispatch('subscribeOnBlockUpdates'),
        dispatch('tokens/subscribeOnTokenUpdates', {}, { root: true }),
      ]).catch(e => dispatch('errors/emitError', e, {root: true}));
    },
    addNewProvider({ state, commit, dispatch, getters }, network) {
      network.id =
        getters.networks.reduce(
          (max, next) => (max.id > next.id ? max.id : next.id)
        ) + 1;
      commit('addNewProvider', network);

      return Promise.all([
        storage.write('networks', state.storedNetworks),
        dispatch('changeNetwork', network.id),
      ]).catch(e => dispatch('errors/emitError', e, {root: true}));
    },
    subscribeOnSyncStatus({ state, commit, dispatch }) {
      const providerCache = state.web3.currentProvider;

      return state.web3.eth.isSyncing().then(resp => {
        if (providerCache === state.web3.currentProvider) {
          commit('setSyncStatus', resp);
          setTimeout(() => {
            dispatch('subscribeOnSyncStatus');
          }, subscribtionsBlockchainInterval);
        } else {
          dispatch('subscribeOnSyncStatus');
        }
      });
    },
    fetchNetworkType({ state, commit }) {
      // network type already set, return resolved promise
      if (state.activeNet.networkType) {
        return Promise.resolve();
      }

      return state.web3.eth.net
        .getNetworkType()
        .then(resp => commit('setNetworkType', resp))
        .catch(e => dispatch('errors/emitError', e, {root: true}));
    },
    subscribeOnBlockUpdates({ state, commit, dispatch, rootState}) {
      if (state.blockSubscribtion) {
        state.blockSubscribtion.stop();
      }
      state.blockSubscribtion = new EthBlockTracker({
        provider: state.web3.currentProvider,
        pollingInterval: subscribtionsBlockchainInterval,
      });
      state.blockSubscribtion.on('latest', block => {
        if (rootState.accounts.activeAccount) {
          dispatch('accounts/updateBalance', {}, { root: true });
        }
        commit(
          'setBlockNumber',
          web3.utils.hexToNumberString(block.number)
        );
      });
      state.blockSubscribtion.start();
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
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
  },
};
