import Web3 from 'web3';
import { infuraConf } from '@/config.js';
import EthBlockTracker from 'eth-block-tracker';
import storage from '@/services/storage';

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
          id: 1,
          name: 'Main',
          url: `https://mainnet.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Ropsten',
          id: 3,
          url: `https://ropsten.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Rinkeby',
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
      if (state.web3) {
        state.web3.setProvider(state.activeNet.url);
      } else {
        state.web3 = new Web3(state.activeNet.url);
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
  },
  actions: {
    changeNetwork({ commit, dispatch, getters }, networkId) {
      const netIndex = getters.networks.findIndex(net => net.id === networkId);
      const network = getters.networks[netIndex];
      commit('changeNetwork', network);
      dispatch('subscribeOnBlockUpdates');
      storage.write('net', network.id);
      return Promise.all([
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
          }, 3000);
        } else {
          context.dispatch('subscribeOnSyncStatus')
        }
      });
      return promise;
    },
    subscribeOnBlockUpdates(context) {
      if (context.state.blockSubscribtion) {
        context.state.blockSubscribtion.stop();
      }
      context.state.blockSubscribtion = new EthBlockTracker({
        provider: context.state.web3.currentProvider,
        pollingInterval:3000
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
