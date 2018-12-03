import Web3 from 'web3';

import web3 from '@/class/singleton/web3';
import { userService } from '@/services';
import { ProviderFactory } from '@/class';
import {
  CHANGE_NETWORK,
  CHANGE_CURRENCY,
  SET_NETWORKS,
  SET_BLOCK_NUMBER,
  SET_HANDLED_BLOCK_NUMBER,
  SET_INTERVAL,
} from './mutations-types';
import { DEFAULT_NETWORKS, CURRENCIES } from '@/constants';

const changeNetwork = async ({ commit, dispatch, getters }, { networkUrl }) => {
  const network = getters.networks.find(net => net.url === networkUrl);

  commit(CHANGE_NETWORK, network);

  return Promise.all([
    userService.setSettings({ net: network.id }),
    dispatch('subscribeOnBlockUpdates'),
    dispatch('price/updatePrice', {}, { root: true }),
    dispatch('accounts/updateBalance', {}, { root: true }),
    dispatch('tokens/getNetworkTokens', {}, { root: true }),
    dispatch('tokens/getCurrentAccountTokens', {}, { root: true }),
    dispatch('tokens/getCurrentAccountTokensData', null, {
      root: true,
    }),
    dispatch('dapp/reset', null, { root: true }),
  ]).catch(e => dispatch('errors/emitError', e, { root: true }));
};

const changeCurrency = async (
  { commit, dispatch, getters, state },
  { currencyId },
) => {
  const currency = CURRENCIES.find(currency => currency.id === currencyId);

  commit(CHANGE_CURRENCY, currency);

  if (state.activeNet.currency !== currency.id) {
    await dispatch('changeNetwork', {
      networkUrl: getters.networks[0].url,
    });
  }
};

const addNetwork = async ({ state, commit, dispatch }, { network }) => {
  const networksToSave = [...state.storedNetworks, network];

  try {
    const { success } = await userService.addNetwork(network);

    commit(SET_NETWORKS, networksToSave);

    await dispatch('changeNetwork', {
      networkUrl: network.url,
    });

    return success;
  } catch (error) {
    await dispatch('errors/emitError', error, { root: true });
  }
};

const updateNetwork = async (
  { state, commit, dispatch },
  { network, oldNetwork },
) => {
  const networksToSave = [...state.storedNetworks];
  const oldNetworkIndex = networksToSave.findIndex(
    item => item.url === oldNetwork.url,
  );

  if (oldNetworkIndex === -1) {
    return;
  }

  networksToSave.splice(oldNetworkIndex, 1, network);

  try {
    const { success } = await userService.updateNetwork(
      oldNetwork.url,
      network,
    );

    commit(SET_NETWORKS, networksToSave);

    if (oldNetwork.url === state.activeNet.url) {
      await dispatch('changeNetwork', { networkUrl: network.url });
    }

    return success;
  } catch (error) {
    await dispatch('errors/emitError', error, { root: true });
  }
};

const deleteNetwork = async (
  { state, commit, dispatch, getters },
  { network },
) => {
  const networksToSave = state.storedNetworks.filter(
    item => item.url !== network.url,
  );

  try {
    const { success } = await userService.removeNetwork(network.url);

    commit(SET_NETWORKS, networksToSave);

    if (network.url === state.activeNet.url) {
      await dispatch('changeNetwork', { networkUrl: getters.networks[0].url });
    }

    return success;
  } catch (error) {
    return dispatch('errors/emitError', error, { root: true });
  }
};

const validateNetwork = (context, { network }) => {
  const providerTemp = ProviderFactory.create(network.url);
  const web3Temp = new Web3(providerTemp);
  const { net } = web3Temp.eth;

  return Promise.all([net.getNetworkType(), net.getId()]);
};

const subscribeOnBlockUpdates = async ({ commit, dispatch, getters }) => {
  await dispatch('unsubscribeOnBlockUpdates');

  const interval = setInterval(async () => {
    const networkId = getters.activeNetwork;
    const blockNumber = await web3.eth.getBlockNumber();

    commit(SET_BLOCK_NUMBER, blockNumber);
    dispatch('handleLastBlock', { blockNumber, networkId });
  }, ENV.blockUpdateInterval);

  commit(SET_INTERVAL, interval);
};

const unsubscribeOnBlockUpdates = async ({ state, commit }) => {
  if (!state.interval) {
    return;
  }

  clearInterval(state.interval);
  commit(SET_INTERVAL, null);
};

const handleLastBlock = async (
  { state, commit, dispatch },
  { blockNumber, networkId },
) => {
  if (state.handledBlockNumber === null) {
    commit(SET_HANDLED_BLOCK_NUMBER, blockNumber - 1);
  }

  const { handledBlockNumber } = state;

  if (handledBlockNumber === blockNumber) return;

  // Trying to get the block again if wrong response
  async function getBlockSafely(num) {
    try {
      const block = await web3.eth.getBlock(num, true);

      if (!block) throw new Error('Bad block');

      return block;
    } catch (error) {
      // TODO fix with debounce provider
      await new Promise(res => setTimeout(res, 1000));
      return getBlockSafely(num);
    }
  }

  for (let i = handledBlockNumber + 1; i <= blockNumber; i += 1) {
    getBlockSafely(i).then(({ transactions }) => {
      dispatch(
        'transactions/handleBlockTransactions',
        { transactions, networkId },
        { root: true },
      );
    });
  }

  commit(SET_HANDLED_BLOCK_NUMBER, blockNumber);
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

    commit(SET_NETWORKS, networks);
    commit(CHANGE_NETWORK, activeNet);
    commit(CHANGE_CURRENCY, activeCurrency);

    await Promise.all([
      dispatch('tokens/getCurrentAccountTokens', {}, { root: true }),
      dispatch('subscribeOnBlockUpdates'),
    ]);
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
  handleLastBlock,
  init,
};
