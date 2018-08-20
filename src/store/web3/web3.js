import Web3 from 'web3';
import EthBlockTracker from 'eth-block-tracker';
import storage from '@/services/storage';
import { infuraConf, blockUpdateInterval } from '@/config';
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
          currency: 1,
          name: 'Main',
          url: `https://mainnet.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Ropsten',
          currency: 2,
          networkType: 'ropsten',
          id: 3,
          url: `https://ropsten.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Rinkeby',
          currency: 2,
          networkType: 'rinkeby',
          id: 4,
          url: `https://rinkeby.infura.io/${infuraConf.key}`,
        },
        {
          name: 'Ethereum classic',
          currency: 3,
          networkType: 'ethClassic',
          id: 61,
          url: 'https://etc-geth.0xinfra.com',
        },
      ],
      currencies: [
        {
          name: 'ETH',
          id: 1,
        },
        {
          name: 'ETH-TEST',
          id: 2,
        },
        {
          name: 'ETC',
          id: 3,
        },
      ],
      storedNetworks: [],
      isSyncing: false,
      blockNumber: 0,
      activeNet,
      activeCurrency: {
        name: 'ETH',
        id: 1,
      },
    };
  },
  getters: {
    networks(state) {
      let networks = state.defaultNetworks.concat(state.storedNetworks);
      return state.activeCurrency
        ? networks.filter(net => net.currency === state.activeCurrency.id)
        : networks;
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
    changeCurrency(state, currency) {
      state.activeCurrency = currency;
    },
    addNewProvider(state, network) {
      state.storedNetworks.push(network);
    },
    setBlockNumber(state, number) {
      state.blockNumber = number;
    },
    setProviders(state, networks) {
      state.storedNetworks = networks;
    },
    setSyncStatus(state, syncObject) {
      state.isSyncing = syncObject;
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
      ]).catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    changeCurrency({ commit, dispatch, getters, state }, currencyId) {
      const currency = state.currencies.find(
        currency => currency.id === currencyId,
      );
      commit('changeCurrency', currency);
      if (state.activeNet.currency !== currency.id) {
        dispatch('changeNetwork', getters.networks[0].id);
      }
    },
    addNewProvider({ state, commit, dispatch, getters }, network) {
      network.id =
        getters.networks.reduce(
          (max, next) => (max.id > next.id ? max.id : next.id),
        ) + 1;
      commit('addNewProvider', network);

      return Promise.all([
        storage.write('networks', state.storedNetworks),
        dispatch('changeNetwork', network.id),
      ]).catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    fetchNetworkType({ state, commit, dispatch }) {
      // network type already set, return resolved promise
      if (state.activeNet.networkType) {
        return Promise.resolve();
      }

      return state.web3.eth.net
        .getNetworkType()
        .then(resp => commit('setNetworkType', resp))
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    validateNetwork(ctx, network) {
      const providerTemp = providerFactory(network.url);
      const web3Temp = new Web3(providerTemp);

      return web3Temp.eth.net.getNetworkType();
    },
    subscribeOnBlockUpdates({ state, commit, dispatch, rootState }) {
      if (state.blockSubscribtion) {
        state.blockSubscribtion.stop();
      }
      state.blockSubscribtion = new EthBlockTracker({
        provider: state.web3.currentProvider,
        pollingInterval: blockUpdateInterval,
      });
      state.blockSubscribtion.on('latest', block => {
        dispatch('accounts/updateBalance', {}, { root: true });
        commit(
          'setBlockNumber',
          state.web3.utils.hexToNumberString(block.number),
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
          ]),
        )
        .then(([storedNetworks, cachedNet]) => {
          const activeNet =
            state.defaultNetworks.find(net => net.id === cachedNet) ||
            storedNetworks.find(net => net.id === cachedNet);
          const activeCurrency =
            state.currencies.find(
              currency => activeNet.currency === currency.id,
            ) || activeCurrency;
          commit('setProviders', storedNetworks || []);
          commit('changeNetwork', activeNet);
          if (activeCurrency) {
            commit('changeCurrency', activeCurrency);
          }
          Promise.all([
            dispatch('tokens/subscribeOnTokenUpdates', {}, { root: true }),
            dispatch('subscribeOnBlockUpdates'),
          ]).catch(e => dispatch('errors/emitError', e, { root: true }));
        })
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
  },
};
