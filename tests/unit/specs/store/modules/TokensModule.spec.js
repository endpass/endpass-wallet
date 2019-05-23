import ModuleRegister from '@/store/class/ModuleRegister';
import createStore from '@/store/createStore';

import ErrorsModule from '@/store/modules/ErrorsModule';
import TokensModule from '@/store/modules/TokensModule';
import PriceModule from '@/store/modules/PriceModule';
import { Network } from '@endpass/class';

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
  fullTokensMappedByAddresses,
  tokensNetBySymbols,
  tokensNetByAddress,
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
});
