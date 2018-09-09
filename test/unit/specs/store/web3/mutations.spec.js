import Web3 from 'web3';

import mutations from '@/store/web3/mutations';
import * as mutationsTypes from '@/store/web3/mutations-types';
import { providerFactory } from '@/class';

jest.mock('@/class', () => ({
  providerFactory: jest.fn(url => ({
    url,
  })),
}));

describe('web3 mutations', () => {
  describe('changeNetwork', () => {
    const changeNetwork = mutations[mutationsTypes.CHANGE_NETWORK];
    const state = {
      activeNet: null,
    };
    const network = { url: 'https://url' };

    beforeAll(() => {
      changeNetwork(state, network);
    });

    it('should change network', () => {
      expect(state.activeNet).toEqual(network);
    });

    it('should destroy DebounceProvider instance', () => {
      expect(Web3.currentProvider.destroy).toHaveBeenCalledTimes(1);
    });

    it('should set web3 provider', () => {
      const provider = providerFactory(network.url);

      expect(Web3.setProvider).toHaveBeenCalledTimes(1);
      expect(Web3.setProvider).toHaveBeenCalledWith(provider);
    });
  });

  describe('changeCurrency', () => {
    const changeCurrency = mutations[mutationsTypes.CHANGE_CURRENCY];

    it('should change currency', () => {
      const state = {
        activeCurrency: null,
      };
      const currency = { name: 'ETH' };

      changeCurrency(state, currency);

      expect(state.activeCurrency).toEqual(currency);
    });
  });

  describe('addNetwork', () => {
    const addNetwork = mutations[mutationsTypes.ADD_NETWORK];

    it('should add network', () => {
      const storedNetworks = [
        {
          id: 1,
          name: 'name',
          url: 'url',
          currency: 1,
        },
      ];
      const network = {
        id: 1,
        name: 'new name',
        url: 'new url',
        currency: 2,
      };
      const expectedStoredNetworks = storedNetworks.concat(network);

      addNetwork({ storedNetworks }, network);

      expect(storedNetworks).toEqual(expectedStoredNetworks);
    });
  });

  describe('updateNetwork', () => {
    const updateNetwork = mutations[mutationsTypes.UPDATE_NETWORK];

    it('should update network', () => {
      const storedNetworks = [
        {
          id: 1,
          name: 'name',
          url: 'url',
          currency: 1,
        },
      ];
      const network = {
        id: 1,
        name: 'new name',
        url: 'new url',
        currency: 2,
      };

      updateNetwork({ storedNetworks }, network);

      expect(storedNetworks).toEqual([network]);
    });

    it('should not update network', () => {
      const storedNetworks = [
        {
          id: 1,
          name: 'name',
          url: 'url',
          currency: 1,
        },
      ];
      const network = {
        id: 2,
        name: 'new name',
        url: 'new url',
        currency: 2,
      };
      const expectedStoredNetworks = [
        {
          id: 1,
          name: 'name',
          url: 'url',
          currency: 1,
        },
      ];

      updateNetwork({ storedNetworks }, network);

      expect(storedNetworks).toEqual(expectedStoredNetworks);
    });
  });

  describe('deleteNetwork', () => {
    const deleteNetwork = mutations[mutationsTypes.DELETE_NETWORK];

    it('should delete network', () => {
      const state = {
        storedNetworks: [{ id: 1 }],
      };
      const network = {
        id: 1,
      };

      deleteNetwork(state, network);

      expect(state.storedNetworks).toEqual([]);
    });

    it('should not delete network', () => {
      const state = {
        storedNetworks: [{ id: 1 }],
      };
      const expectedStoredNetworks = [{ id: 1 }];
      const network = {
        id: 2,
      };

      deleteNetwork(state, network);

      expect(state.storedNetworks).toEqual(expectedStoredNetworks);
    });
  });

  describe('setNetworks', () => {
    const setNetworks = mutations[mutationsTypes.SET_NETWORKS];

    it('should set networks', () => {
      const state = {
        storedNetworks: [],
      };
      const networks = [
        {
          id: 1,
          name: 'new name',
          url: 'new url',
          currency: 2,
        },
      ];

      setNetworks(state, networks);

      expect(state.storedNetworks).toEqual(networks);
    });
  });

  describe('setBlockNumber', () => {
    const setBlockNumber = mutations[mutationsTypes.SET_BLOCK_NUMBER];

    it('should set block number', () => {
      const state = {
        blockNumber: 0,
      };
      const blockNumber = 1;

      setBlockNumber(state, blockNumber);

      expect(state.blockNumber).toBe(blockNumber);
    });
  });

  describe('setInterval', () => {
    const setInterval = mutations[mutationsTypes.SET_INTERVAL];

    it('should set interval', () => {
      const state = {
        interval: 0,
      };
      const interval = 1;

      setInterval(state, interval);

      expect(state.interval).toBe(interval);
    });
  });
});
