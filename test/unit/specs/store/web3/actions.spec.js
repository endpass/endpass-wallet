import Web3 from 'web3';

import actions from '@/store/web3/actions';
import * as mutationsTypes from '@/store/web3/mutations-types';
import { userService } from '@/services';
import { DEFAULT_NETWORKS, CURRENCIES } from '@/constants';
import { blockTransactions } from 'fixtures/transactions';

jest.useFakeTimers();

describe('web3 actions', () => {
  const commit = jest.fn();
  const dispatch = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changeNetwork', () => {
    const { changeNetwork } = actions;
    const networkId = 1;
    const networkUrl = 'url';
    const network = { id: networkId, url: networkUrl };
    const getters = {
      networks: [network],
    };

    it('should call CHANGE_NETWORK mutation', async () => {
      expect.assertions(2);

      await changeNetwork({ commit, dispatch, getters }, { networkUrl });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        mutationsTypes.CHANGE_NETWORK,
        network,
      );
    });

    it('should save network id', async () => {
      expect.assertions(2);

      await changeNetwork({ commit, dispatch, getters }, { networkUrl });

      expect(userService.setSettings).toHaveBeenCalledTimes(1);
      expect(userService.setSettings).toHaveBeenCalledWith({ net: networkId });
    });

    it('should dispatch subscribeOnBlockUpdates, tokens/getCurrentAccountTokens and tokens/getCurrentAccountTokensData actions', async () => {
      expect.assertions(1);

      await changeNetwork({ commit, dispatch, getters }, { networkUrl });

      expect(dispatch.mock.calls).toEqual([
        ['subscribeOnBlockUpdates'],
        ['price/updatePrice', {}, { root: true }],
        ['accounts/updateBalance', {}, { root: true }],
        ['tokens/getNetworkTokens', {}, { root: true }],
        ['tokens/getCurrentAccountTokens', {}, { root: true }],
        ['tokens/getCurrentAccountTokensData', null, { root: true }],
        ['dapp/reset', null, { root: true }],
      ]);
    });

    it('should handle errors', async () => {
      expect.assertions(4);

      const error = new Error();

      userService.setSettings.mockRejectedValueOnce(error);

      await changeNetwork({ commit, dispatch, getters }, { networkUrl });

      expect(dispatch).toHaveBeenCalledTimes(8);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });

      dispatch.mockClear();
      dispatch.mockRejectedValueOnce(error);

      await changeNetwork({ commit, dispatch, getters }, { networkUrl });

      expect(dispatch).toHaveBeenCalledTimes(8);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('changeCurrency', () => {
    const { changeCurrency } = actions;
    const getters = {
      networks: [{ url: 'url' }],
    };
    const currencyId = 1;

    it('should call CHANGE_CURRENCY mutation', async () => {
      expect.assertions(2);

      const state = {
        activeNet: {},
      };
      const currency = CURRENCIES.find(currency => currency.id === currencyId);

      await changeCurrency(
        { commit, dispatch, getters, state },
        { currencyId },
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        mutationsTypes.CHANGE_CURRENCY,
        currency,
      );
    });

    it('should dispatch changeNetwork action', async () => {
      expect.assertions(2);

      const state = {
        activeNet: {
          currency: currencyId + 1,
        },
      };

      await changeCurrency(
        { commit, dispatch, getters, state },
        { currencyId },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('changeNetwork', {
        networkUrl: getters.networks[0].url,
      });
    });

    it('should not dispatch changeNetwork action', async () => {
      expect.assertions(1);

      const state = {
        activeNet: {
          currency: currencyId,
        },
      };

      await changeCurrency(
        { commit, dispatch, getters, state },
        { currencyId },
      );

      expect(dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('addNetwork', () => {
    const { addNetwork } = actions;
    const state = {
      storedNetworks: [],
    };
    const network = { url: 'url' };
    const networksToSave = [...state.storedNetworks, network];

    it('should call userService.setSetting', () => {
      expect.assertions(2);

      addNetwork({ commit, dispatch, state }, { network });

      expect(userService.addNetwork).toHaveBeenCalledTimes(1);
      expect(userService.addNetwork).toHaveBeenCalledWith(network);
    });

    it('should call SET_NETWORKS mutation', async () => {
      expect.assertions(2);

      await addNetwork({ commit, dispatch, state }, { network });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        mutationsTypes.SET_NETWORKS,
        networksToSave,
      );
    });

    it('should dispatch changeNetwork action', async () => {
      expect.assertions(2);

      await addNetwork({ commit, dispatch, state }, { network });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('changeNetwork', {
        networkUrl: network.url,
      });
    });

    it('should handle the error of adding a new provider', async () => {
      expect.assertions(3);

      const error = new Error();

      userService.addNetwork.mockRejectedValueOnce(error);

      await addNetwork({ commit, dispatch, state }, { network });

      expect(commit).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });

    it('should return success status', async () => {
      expect.assertions(2);

      let setSettingResponse = { success: true };
      let response;

      userService.addNetwork.mockResolvedValue(setSettingResponse);
      response = await addNetwork({ commit, dispatch, state }, { network });

      expect(response).toBe(setSettingResponse.success);

      setSettingResponse = { success: false };
      userService.addNetwork.mockResolvedValue(setSettingResponse);
      response = await addNetwork({ commit, dispatch, state }, { network });

      expect(response).toBe(setSettingResponse.success);
    });
  });

  describe('updateNetwork', () => {
    const { updateNetwork } = actions;
    const oldNetwork = { url: 'old url' };
    const network = { url: 'new url' };
    const state = {
      storedNetworks: [oldNetwork],
      activeNet: oldNetwork,
    };

    it('should not do anything', async () => {
      expect.assertions(3);

      await updateNetwork(
        { commit, dispatch, state },
        { network, oldNetwork: network },
      );

      expect(userService.updateNetwork).toHaveBeenCalledTimes(0);
      expect(commit).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should call userService.updateNetwork', () => {
      updateNetwork({ commit, dispatch, state }, { network, oldNetwork });

      expect(userService.updateNetwork).toHaveBeenCalledTimes(1);
      expect(userService.updateNetwork).toHaveBeenCalledWith(
        oldNetwork.url,
        network,
      );
    });

    it('should call SET_NETWORKS mutation', async () => {
      expect.assertions(2);

      const networksToSave = [network];

      await updateNetwork({ commit, dispatch, state }, { network, oldNetwork });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        mutationsTypes.SET_NETWORKS,
        networksToSave,
      );
    });

    it('should dispatch changeNetwork action', async () => {
      expect.assertions(2);

      await updateNetwork({ commit, dispatch, state }, { network, oldNetwork });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('changeNetwork', {
        networkUrl: network.url,
      });
    });

    it('should not dispatch changeNetwork action', async () => {
      expect.assertions(1);

      const oldNetwork = {};

      await updateNetwork({ commit, dispatch, state }, { network, oldNetwork });

      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle the network update error', async () => {
      expect.assertions(3);

      const error = new Error();

      userService.updateNetwork.mockRejectedValueOnce(error);

      await updateNetwork({ commit, dispatch, state }, { network, oldNetwork });

      expect(commit).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });

    it('should return success status', async () => {
      expect.assertions(2);

      let setSettingResponse = { success: true };
      let response;

      userService.updateNetwork.mockResolvedValue(setSettingResponse);

      response = await updateNetwork(
        { commit, dispatch, state },
        { network, oldNetwork },
      );

      expect(response).toBe(setSettingResponse.success);

      setSettingResponse = { success: false };
      userService.updateNetwork.mockResolvedValue(setSettingResponse);
      response = await updateNetwork(
        { commit, dispatch, state },
        { network, oldNetwork },
      );

      expect(response).toBe(setSettingResponse.success);
    });
  });

  describe('deleteNetwork', () => {
    const { deleteNetwork } = actions;
    const network = { url: 'url' };
    const state = {
      storedNetworks: [network],
      activeNet: network,
    };
    const getters = {
      networks: [{ url: 'new url' }],
    };

    it('should call userService.removeNetwork', async () => {
      expect.assertions(2);

      await deleteNetwork({ commit, dispatch, getters, state }, { network });

      expect(userService.removeNetwork).toHaveBeenCalledTimes(1);
      expect(userService.removeNetwork).toBeCalledWith(network.url);
    });

    it('should call SET_NETWORKS mutation', async () => {
      expect.assertions(2);

      const networksToSave = [];

      await deleteNetwork({ commit, dispatch, state, getters }, { network });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        mutationsTypes.SET_NETWORKS,
        networksToSave,
      );
    });

    it('should dispatch changeNetwork action', async () => {
      expect.assertions(2);

      await deleteNetwork({ commit, dispatch, getters, state }, { network });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('changeNetwork', {
        networkUrl: getters.networks[0].url,
      });
    });

    it('should not dispatch changeNetwork action', async () => {
      expect.assertions(1);

      const network = {};

      await deleteNetwork({ commit, dispatch, getters, state }, { network });

      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle the removal error of the network', async () => {
      expect.assertions(3);

      const error = new Error();

      userService.removeNetwork.mockRejectedValueOnce(error);

      await deleteNetwork({ commit, dispatch, getters, state }, { network });

      expect(commit).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });

    it('should return success status', async () => {
      expect.assertions(2);

      let setSettingResponse = { success: true };
      let response;

      userService.removeNetwork.mockResolvedValue(setSettingResponse);

      response = await deleteNetwork(
        { commit, dispatch, getters, state },
        { network },
      );

      expect(response).toBe(setSettingResponse.success);

      setSettingResponse = { success: false };
      userService.removeNetwork.mockResolvedValue(setSettingResponse);
      response = await deleteNetwork(
        { commit, dispatch, getters, state },
        { network },
      );

      expect(response).toBe(setSettingResponse.success);
    });
  });

  describe('validateNetwork', () => {
    const { validateNetwork } = actions;

    it('should return network type and network id', async () => {
      expect.assertions(2);

      const context = {};
      const network = {
        url: 'https://url',
      };
      let networkType;
      let networkId;
      let result;

      networkType = 'ropsten';
      networkId = 3;

      Web3.eth.net.getNetworkType.mockResolvedValueOnce(networkType);
      Web3.eth.net.getId.mockResolvedValueOnce(networkId);

      result = await validateNetwork(context, { network });

      expect(result).toEqual([networkType, networkId]);

      networkType = 'main';
      networkId = 1;

      Web3.eth.net.getNetworkType.mockResolvedValueOnce(networkType);
      Web3.eth.net.getId.mockResolvedValueOnce(networkId);

      result = await validateNetwork(context, { network });

      expect(result).toEqual([networkType, networkId]);
    });
  });

  describe('subscribeOnBlockUpdates', () => {
    const { subscribeOnBlockUpdates } = actions;

    it('should dispatch unsubscribeOnBlockUpdates action', async () => {
      expect.assertions(2);

      await subscribeOnBlockUpdates({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('unsubscribeOnBlockUpdates');
    });

    it('should call setInterval with correct interval', async () => {
      expect.assertions(2);

      await subscribeOnBlockUpdates({ commit, dispatch });

      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        ENV.blockUpdateInterval,
      );
    });

    it('should call SET_INTERVAL mutation', async () => {
      expect.assertions(2);

      const interval = 1;

      setInterval.mockReturnValue(interval);

      await subscribeOnBlockUpdates({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        mutationsTypes.SET_INTERVAL,
        interval,
      );
    });
  });

  describe('unsubscribeOnBlockUpdates', () => {
    const { unsubscribeOnBlockUpdates } = actions;
    const state = {
      interval: 1,
    };

    it('should clear interval', async () => {
      expect.assertions(2);

      await unsubscribeOnBlockUpdates({ state, commit });

      expect(clearInterval).toHaveBeenCalledTimes(1);
      expect(clearInterval).toHaveBeenCalledWith(state.interval);
    });

    it('should call SET_INTERVAL mutation', async () => {
      expect.assertions(2);

      await unsubscribeOnBlockUpdates({ state, commit });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(mutationsTypes.SET_INTERVAL, null);
    });

    it('should not do anything', async () => {
      expect.assertions(2);

      const state = {};

      await unsubscribeOnBlockUpdates({ state, commit });

      expect(clearInterval).toHaveBeenCalledTimes(0);
      expect(commit).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleLastBlock', () => {
    const { handleLastBlock } = actions;
    const blockNumber = 12;
    const state = { handledBlockNumber: 11 };

    it('should set initial handled block number', async () => {
      expect.assertions(2);

      const state = { handledBlockNumber: null };

      await handleLastBlock({ state, commit, dispatch }, { blockNumber });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(
        1,
        mutationsTypes.SET_HANDLED_BLOCK_NUMBER,
        blockNumber - 1,
      );
    });

    it('should set last handled block number', async () => {
      expect.assertions(2);

      await handleLastBlock({ state, commit, dispatch }, { blockNumber });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(
        mutationsTypes.SET_HANDLED_BLOCK_NUMBER,
        blockNumber,
      );
    });

    it('should not get a block number if it has been handled', async () => {
      expect.assertions(2);

      await handleLastBlock({ state, commit, dispatch }, { blockNumber: 11 });

      expect(Web3.eth.getBlock).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle transactions', async () => {
      expect.assertions(3);

      const transactions = [...blockTransactions];

      Web3.eth.getBlock.mockResolvedValueOnce(null);
      Web3.eth.getBlock.mockRejectedValueOnce();
      Web3.eth.getBlock.mockResolvedValueOnce({ transactions });

      await handleLastBlock({ state, commit, dispatch }, { blockNumber });

      // TODO for fix getBlockSafety
      await global.flushPromises();
      jest.advanceTimersByTime(1000);
      await global.flushPromises();
      jest.advanceTimersByTime(1000);
      await global.flushPromises();
      jest.advanceTimersByTime(1000);

      expect(Web3.eth.getBlock).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'transactions/handleBlockTransactions',
        { transactions },
        { root: true },
      );
    });
  });

  describe('init', () => {
    const { init } = actions;
    const state = {
      activeCurrency: CURRENCIES[0],
    };

    it('should call SET_NETWORKS, CHANGE_NETWORK, CHANGE_CURRENCY mutations', async () => {
      expect.assertions(1);

      const net = 10;
      const activeNet = {
        id: net,
        name: 'name',
        url: 'url',
        currency: 2,
      };
      const networks = [activeNet];
      const activeCurrency = CURRENCIES.find(
        currency => currency.id === activeNet.currency,
      );

      userService.getSettings.mockResolvedValueOnce({ net, networks });

      await init({ commit, dispatch, state });

      expect(commit.mock.calls).toEqual([
        [mutationsTypes.SET_NETWORKS, networks],
        [mutationsTypes.CHANGE_NETWORK, activeNet],
        [mutationsTypes.CHANGE_CURRENCY, activeCurrency],
      ]);
    });

    it('should call SET_NETWORKS, CHANGE_NETWORK, CHANGE_CURRENCY mutations with default settings', async () => {
      expect.assertions(1);

      const net = 1;
      const networks = [];
      const activeNet = DEFAULT_NETWORKS.find(network => network.id === net);
      const activeCurrency = CURRENCIES.find(
        currency => currency.id === activeNet.currency,
      );

      userService.getSettings.mockResolvedValueOnce({});

      await init({ commit, dispatch, state });

      expect(commit.mock.calls).toEqual([
        [mutationsTypes.SET_NETWORKS, networks],
        [mutationsTypes.CHANGE_NETWORK, activeNet],
        [mutationsTypes.CHANGE_CURRENCY, activeCurrency],
      ]);
    });

    it('should dispatch getCurrentAccountTokens and subscribeOnBlockUpdates actions', async () => {
      expect.assertions(1);

      await init({ commit, dispatch, state });

      expect(dispatch.mock.calls).toEqual([
        ['tokens/getCurrentAccountTokens', {}, { root: true }],
        ['subscribeOnBlockUpdates'],
      ]);
    });

    it('should handle errors', async () => {
      expect.assertions(4);

      const error = new Error();

      userService.getSettings.mockRejectedValueOnce(error);

      await init({ commit, dispatch, state });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });

      dispatch.mockClear();
      dispatch.mockRejectedValueOnce(error);

      await init({ commit, dispatch, state });

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });
});
