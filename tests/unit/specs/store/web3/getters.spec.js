import getters from '@/store/web3/getters';
import { Network } from '@endpass/class';

describe('web3 getters', () => {
  describe('networks', () => {
    const { networks } = getters;
    const storedNetworks = [{ url: 'url 1', currency: 1 }, { url: 'url 2' }];

    it('should return all networks', () => {
      const expected = [
        ...Object.values(Network.DEFAULT_NETWORKS),
        ...storedNetworks,
      ];

      expect(networks({ storedNetworks })).toEqual(expected);
    });

    it('return the network with active currency', () => {
      const activeCurrency = Network.CURRENCIES[0];
      const expected = [
        Network.DEFAULT_NETWORKS[Network.NET_ID.MAIN],
        storedNetworks[0],
      ];

      expect(networks({ storedNetworks, activeCurrency })).toEqual(expected);
    });
  });

  describe('isCustomNetwork', () => {
    const { isCustomNetwork } = getters;

    it('should return true', () => {
      const network = {
        id: 5,
        url: 'url 5',
      };

      expect(isCustomNetwork()(network)).toBeTruthy();
    });

    it('should return false', () => {
      let network = { id: -1 };

      expect(isCustomNetwork()(network)).toBeFalsy();

      network = {
        id: 1,
        url: Network.DEFAULT_NETWORKS[Network.NET_ID.MAIN].url,
      };

      expect(isCustomNetwork()(network)).toBeFalsy();
    });
  });
});
