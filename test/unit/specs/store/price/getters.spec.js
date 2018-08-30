import getters from '@/store/price/getters';

describe('price getters', () => {
  describe('activeCurrencyName', () => {
    it('should return currency name from web3', () => {
      let rootState = {
        web3: {
          activeCurrency: {
            name: 'kek',
          },
        },
      };
      expect(getters.activeCurrencyName(1, 1, rootState)).toBe('kek');
    });
  });
  describe('fiatCurrency', () => {
    it('should return fiatCurrency from settings', () => {
      let rootState = {
        accounts: {
          settings: {
            fiatCurrency: 'kek',
          },
        },
      };
      expect(getters.fiatCurrency(1, 1, rootState)).toBe('kek');
    });
  });
});
