import Web3 from 'web3';

import { userService } from '@/services';
import { ProviderFactory, web3 } from '@/class';
import {
  CHANGE_NETWORK,
  CHANGE_CURRENCY,
  SET_NETWORKS,
  SET_BLOCK_NUMBER,
  SET_HANDLED_BLOCK_NUMBER,
} from './mutations-types';
import { DEFAULT_NETWORKS, CURRENCIES } from '@/constants';

const changeNetwork = async ({ commit, dispatch, getters }, { networkUrl }) => {
  const network = getters.networks.find(net => net.url === networkUrl);

  commit(CHANGE_NETWORK, network);
  commit(SET_HANDLED_BLOCK_NUMBER, null);
  commit(SET_BLOCK_NUMBER, null);

  return Promise.all([
    userService.setSettings({ net: network.id }),
    dispatch('price/updatePrice', {}, { root: true }),
    dispatch('accounts/updateBalance', {}, { root: true }),
    dispatch('tokens/getNetworkTokens', {}, { root: true }),    
    dispatch(
      'transactions/updatePendingTransactionsStatus',
      {},
      { root: true },
    ),
    dispatch('dapp/reset', null, { root: true }),
  ]).catch(e => dispatch('errors/emitError', e, { root: true }));
};

const changeCurrency = async (
  { commit, dispatch, getters, state },
  { currencyId },
) => {
  const currency = CURRENCIES.find(({ id }) => id === currencyId);

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

const subscribeOnBlockUpdates = async ({ commit, dispatch }) => {
  web3.eth
    .subscribe('newBlockHeaders')
    .on('data', ({ number }) => {
      commit(SET_BLOCK_NUMBER, number);
      dispatch('handleLastBlock', { blockNumber: number });
    })
    .on('error', error => {
      console.error('Web3 subscription error', error);
    });
};

const handleLastBlock = async (
  { state, commit, dispatch, getters },
  { blockNumber },
) => {
  try {
    const { activeNetwork: networkId } = getters;
    const getBlockPromises = [];
    let handledBlockNumber = state.handledBlockNumber || blockNumber - 1;

    for (let i = handledBlockNumber; i < blockNumber; i++) {
      getBlockPromises.push(web3.eth.getBlock(i + 1, true));
    }

    const blocks = await Promise.all(getBlockPromises);

    for (let block of blocks) {
      if (!block) {
        continue;
      }

      handledBlockNumber = block.number;

      await dispatch(
        'transactions/handleBlockTransactions',
        {
          transactions: block.transactions,
          networkId,
        },
        { root: true },
      );
    }

    commit(SET_HANDLED_BLOCK_NUMBER, handledBlockNumber);
  } catch (error) {
    await dispatch('errors/emitError', error, { root: true });
  }
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
  handleLastBlock,
  init,
};
