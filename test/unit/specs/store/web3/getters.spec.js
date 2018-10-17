import getters from '@/store/web3/getters';
import { DEFAULT_NETWORKS, CURRENCIES } from '@/constants';

describe('web3 getters', () => {
  describe('networks', () => {
    const { networks } = getters;
    const storedNetworks = [{ url: 'url 1', currency: 1 }, { url: 'url 2' }];

    it('should return all networks', () => {
      const expected = [...DEFAULT_NETWORKS, ...storedNetworks];

      expect(networks({ storedNetworks })).toEqual(expected);
    });

    it('return the network with active currency', () => {
      const activeCurrency = CURRENCIES[0];
      const expected = [DEFAULT_NETWORKS[0], storedNetworks[0]];

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
        url: `https://mainnet.infura.io/${ENV.infuraConf.key}`,
      };

      expect(isCustomNetwork()(network)).toBeFalsy();
    });
  });
});
