import ModuleRegister from '@/store/class/ModuleRegister';
import createStore from '@/store/createStore';

import ErrorsModule from '@/store/modules/ErrorsModule';
import TokensModule from '@/store/modules/TokensModule';
import PriceModule from '@/store/modules/PriceModule';
import { Network } from '@endpass/class';
import cryptoDataService from '@/services/cryptoData';
import tokenInfoService from '@/services/tokeninfo';

import { address } from 'fixtures/accounts';
import {
  tokens,
  token,
  tokensMappedByAddresses,
  networkTokensMappedByAddresses,
  tokensMappedByNetworks,
  expandedTokensMappedByNetworks,
  cuttedTokensMappedByNetworks,
  tokensPrices,

  tokensPricesBySymbols,
  fullTokensMappedByAddresses,
  tokensNetBySymbols,
  tokensNetByAddress,
  allTokens,
} from 'fixtures/tokens';

describe('PriceModule', () => {
  let store;
  let moduleRegister;
  let errorsModule;
  let tokensModule;
  let priceModule;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore({
      web3: {
        activeCurrency: Network.CURRENCIES[0],
        activeNet: {
          id: Network.NET_ID.MAIN,
        },
      },
      user: {
        settings: { fiatCurrency: 'USD' },
      },
      accounts: {
        address,
      },
    });

    moduleRegister = new ModuleRegister(store);

    const modules = moduleRegister.registerModules({
      errors: ErrorsModule,
      tokens: TokensModule,
      price: PriceModule,
    });

    ({
      errors: errorsModule,
      price: priceModule,
      tokens: tokensModule,
    } = modules);
  });

  describe('initial', () => {
    it('should be correct initial state', async () => {
      expect.assertions(7);

      expect(tokensModule.isLoading).toBe(false);

      await tokensModule.init();

      console.log('fullTokensMappedByAddresses', fullTokensMappedByAddresses);

      expect(tokensModule.prices).toEqual({});
      expect(tokensModule.networkTokens).toEqual(fullTokensMappedByAddresses);
      expect(tokensModule.userTokens).toEqual({});
      expect(tokensModule.tokensByAddress).toEqual({});
      expect(tokensModule.balancesByAddress).toEqual({});
      expect(tokensModule.isLoading).toBe(false);
    });
  });

  describe('setUserTokens', () => {
    it('should NOT update user tokens and prices', async () => {
      expect.assertions(2);

      await tokensModule.setUserTokens({});

      expect(tokensModule.userTokens).toEqual({});
      expect(tokensModule.prices).toEqual({});
    });

    it('should update user tokens and prices', async () => {
      expect.assertions(2);

      await tokensModule.setUserTokens(tokensNetBySymbols);

      expect(tokensModule.userTokens).toEqual(tokensNetByAddress);
      expect(tokensModule.prices).toEqual({ ETH: { USD: 10 } });
    });
  });

  describe('setTokensInfoByAddress', () => {
    it('should set prices, balance, network tokens', async () => {
      expect.assertions(4);

      await tokensModule.setTokensInfoByAddress({ address, tokens });

      expect(tokensModule.prices).toEqual(tokensPricesBySymbols);
      expect(tokensModule.balancesByAddress).toEqual({ [address]: { FST: '0', SCDT: '0' } });
      expect(tokensModule.tokensByAddress).toEqual({
        [address]: tokens.map(item => item.address),
      });
      expect(tokensModule.networkTokens)
        .toEqual(networkTokensMappedByAddresses);
    });
  });

  describe('loadTokenPrices', () => {
    it('should update token prices', async () => {
      expect.assertions(2);

      expect(tokensModule.prices).toEqual({});

      await tokensModule.loadTokenPrices({ tokensSymbols: tokens });

      expect(tokensModule.prices).toEqual({ ETH: { USD: 10 } });
    });

    it('should drop token prices', async () => {
      expect.assertions(2);

      expect(tokensModule.prices).toEqual({});

      const err = new Error();
      cryptoDataService.getSymbolsPrices.mockRejectedValueOnce(err);
      await tokensModule.loadTokenPrices({ tokensSymbols: tokens });

      expect(tokensModule.prices).toEqual({});
    });

    it('should not to do anything, if tokens is empty', async () => {
      expect.assertions(3);

      expect(tokensModule.prices).toEqual({});

      await tokensModule.loadTokenPrices({ tokensSymbols: [] });

      expect(tokensModule.prices).toEqual({});
      expect(cryptoDataService.getSymbolsPrices).not.toBeCalled();
    });
  });

  describe('loadNetworkTokens', () => {
    it('should set network tokens', async () => {
      expect.assertions(5);

      expect(tokensModule.networkTokens)
        .toEqual({});
      expect(tokensModule.isLoading).toBe(false);

      const mock = jest.fn();
      errorsModule.errorEmitter.once('error', mock);

      await tokensModule.loadNetworkTokens();

      expect(tokensModule.isLoading).toBe(false);
      expect(tokensModule.networkTokens)
        .toEqual(tokensMappedByAddresses);
      expect(mock).not.toBeCalled();
    });

    it('should handle error and set empty object as network tokens', async () => {
      expect.assertions(5);

      expect(tokensModule.networkTokens)
        .toEqual({});
      expect(tokensModule.isLoading).toBe(false);

      const mock = jest.fn();
      errorsModule.errorEmitter.once('error', mock);
      tokenInfoService.getTokensList.mockRejectedValueOnce();

      await tokensModule.loadNetworkTokens();

      expect(tokensModule.isLoading).toBe(false);
      expect(tokensModule.networkTokens)
        .toEqual({});
      expect(mock).toBeCalled();
    });

    it('should correct switch isLoading flag', async () => {
      expect.assertions(3);

      expect(tokensModule.isLoading).toBe(false);

      tokensModule.loadNetworkTokens();

      expect(tokensModule.isLoading).toBe(true);

      await global.flushPromises();

      expect(tokensModule.isLoading).toBe(false);
    });

    it.skip('should not set network tokens, if network is not main', async () => {
      // TODO: add switch current network, when web3 module will be implement and update test flow
      expect.assertions(2);

      expect(tokensModule.networkTokens)
        .toEqual({});

      await tokensModule.loadNetworkTokens();

      expect(tokensModule.networkTokens)
        .toEqual(tokensMappedByAddresses);
    });
  });
});
