import Web3 from 'web3';

import web3 from '@/utils/web3';
import { userService } from '@/services';
import { providerFactory } from '@/class';
import { blockUpdateInterval } from '@/config';
import * as mutationsTypes from './mutations-types';
import { DEFAULT_NETWORKS, CURRENCIES } from '@/constants';

const changeNetwork = async ({ commit, dispatch, getters }, { networkId }) => {
  const network = getters.networks.find(net => net.id === networkId);

  commit(mutationsTypes.CHANGE_NETWORK, network);

  return Promise.all([
    userService.setSetting('net', network.id),
    dispatch('subscribeOnBlockUpdates'),
    dispatch('tokens/subscribeOnTokensBalancesUpdates', {}, { root: true }),
  ]).catch(e => dispatch('errors/emitError', e, { root: true }));
};

const changeCurrency = async (
  { commit, dispatch, getters, state },
  { currencyId },
) => {
  const currency = CURRENCIES.find(currency => currency.id === currencyId);

  commit(mutationsTypes.CHANGE_CURRENCY, currency);

  if (state.activeNet.currency !== currency.id) {
    await dispatch('changeNetwork', {
      networkId: getters.networks[0].id,
    });
  }
};

const addNetwork = async ({ state, commit, dispatch }, { network }) => {
  commit(mutationsTypes.ADD_NETWORK, network);

  return Promise.all([
    userService.setSetting('networks', state.storedNetworks),
    dispatch('changeNetwork', {
      networkId: network.id,
    }),
  ]).catch(e => dispatch('errors/emitError', e, { root: true }));
};

const updateNetwork = async ({ state, commit, dispatch }, { network }) => {
  commit(mutationsTypes.UPDATE_NETWORK, network);

  try {
    await userService.setSetting('networks', state.storedNetworks);
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const deleteNetwork = async (
  { state, commit, dispatch, getters },
  { network },
) => {
  commit(mutationsTypes.DELETE_NETWORK, network);

  const promises = [userService.setSetting('networks', state.storedNetworks)];

  if (network.url === state.activeNet.url) {
    promises.push(
      dispatch('changeNetwork', {
        networkId: getters.networks[0].id,
      }),
    );
  }

  return Promise.all(promises).catch(e =>
    dispatch('errors/emitError', e, { root: true }),
  );
};

const validateNetwork = (context, { network }) => {
  const providerTemp = providerFactory(network.url);
  const web3Temp = new Web3(providerTemp);
  const { net } = web3Temp.eth;

  return Promise.all([net.getNetworkType(), net.getId()]);
};

const subscribeOnBlockUpdates = async ({ commit, dispatch }) => {
  await dispatch('unsubscribeOnBlockUpdates');

  const interval = setInterval(async () => {
    commit(mutationsTypes.SET_BLOCK_NUMBER, await web3.eth.getBlockNumber());
  }, blockUpdateInterval);

  commit(mutationsTypes.SET_INTERVAL, interval);
};

const unsubscribeOnBlockUpdates = async ({ state, commit }) => {
  if (!state.interval) {
    return;
  }

  clearInterval(state.interval);
  commit(mutationsTypes.SET_INTERVAL, null);
};

const init = async ({ commit, dispatch, state }) => {
  try {
    const { net = 1, networks = [] } = await userService.getSettings();
    const activeNet = [...DEFAULT_NETWORKS, ...networks].find(
      network => network.id === net,
    );
    const activeCurrency =
      CURRENCIES.find(currency => activeNet.currency === currency.id) ||
      state.activeCurrency;

    commit(mutationsTypes.SET_NETWORKS, networks);
    commit(mutationsTypes.CHANGE_NETWORK, activeNet);
    commit(mutationsTypes.CHANGE_CURRENCY, activeCurrency);

    await dispatch(
      'tokens/subscribeOnTokensBalancesUpdates',
      {},
      { root: true },
    );
    await dispatch('subscribeOnBlockUpdates');
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

export default {
  changeNetwork,
  changeCurrency,
  addNetwork,
  updateNetwork,
  deleteNetwork,
  validateNetwork,
  subscribeOnBlockUpdates,
  unsubscribeOnBlockUpdates,
  init,
};
