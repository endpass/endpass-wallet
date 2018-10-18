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

  describe('setHandledBlockNumber', () => {
    const setHandledBlockNumber =
      mutations[mutationsTypes.SET_HANDLED_BLOCK_NUMBER];

    it('should set last handled block number', () => {
      const state = {
        handledBlockNumber: 0,
      };
      const handledBlockNumber = 1;

      setHandledBlockNumber(state, handledBlockNumber);

      expect(state.handledBlockNumber).toBe(handledBlockNumber);
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
