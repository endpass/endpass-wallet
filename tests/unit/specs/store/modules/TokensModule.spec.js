import Network from '@endpass/class/Network';
import { address } from 'fixtures/accounts';
import {
  tokens,
  tokensMappedByAddresses,
  networkTokensMappedByAddresses,
  tokensPricesBySymbols,
  fullTokensMappedByAddresses,
  tokensNetBySymbols,
  tokensNetByAddress,
} from 'fixtures/tokens';
import ModuleRegister from '@/store/class/ModuleRegister';
import createStore from '@/store/createStore';

import ErrorsModule from '@/store/modules/ErrorsModule';
import TokensModule from '@/store/modules/TokensModule';
import PriceModule from '@/store/modules/PriceModule';
import tokenInfoService from '@/services/tokeninfo';
import userService from '@/services/user';

import { Token } from '@/class';

describe('TokensModule', () => {
  let store;
  let moduleRegister;
  let errorsModule;
  let tokensModule;

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

    ({ errors: errorsModule, tokens: tokensModule } = modules);
  });

  describe('initial', () => {
    it('should be correct initial state', async () => {
      expect.assertions(7);

      expect(tokensModule.isLoading).toBe(false);

      await tokensModule.init();

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
      expect(tokensModule.balancesByAddress).toEqual({
        [address]: { FST: '0', SCDT: '0' },
      });
      expect(tokensModule.tokensByAddress).toEqual({
        [address]: tokens.map(item => item.address),
      });
      expect(tokensModule.networkTokens).toEqual(
        networkTokensMappedByAddresses,
      );
    });
  });

  describe('loadNetworkTokens', () => {
    it('should set network tokens', async () => {
      expect.assertions(5);

      expect(tokensModule.networkTokens).toEqual({});
      expect(tokensModule.isLoading).toBe(false);

      const mock = jest.fn();
      errorsModule.errorEmitter.once('error', mock);

      await tokensModule.loadNetworkTokens();

      expect(tokensModule.isLoading).toBe(false);
      expect(tokensModule.networkTokens).toEqual(tokensMappedByAddresses);
      expect(mock).not.toBeCalled();
    });

    it('should handle error and set empty object as network tokens', async () => {
      expect.assertions(5);

      expect(tokensModule.networkTokens).toEqual({});
      expect(tokensModule.isLoading).toBe(false);

      const mock = jest.fn();
      errorsModule.errorEmitter.once('error', mock);
      tokenInfoService.getTokensList.mockRejectedValueOnce();

      await tokensModule.loadNetworkTokens();

      expect(tokensModule.isLoading).toBe(false);
      expect(tokensModule.networkTokens).toEqual({});
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

      expect(tokensModule.networkTokens).toEqual({});

      await tokensModule.loadNetworkTokens();

      expect(tokensModule.networkTokens).toEqual(tokensMappedByAddresses);
    });
  });

  describe('removeUserToken', () => {
    it('should handle error', async () => {
      expect.assertions(1);

      const error = new Error();
      userService.removeToken.mockRejectedValueOnce(error);
      const mock = jest.fn();
      errorsModule.errorEmitter.once('error', mock);
      await tokensModule.setUserTokens(tokensNetBySymbols);

      await tokensModule.removeUserToken({ token: tokens[0] });

      expect(mock).toBeCalled();
    });

    it('should not call remove, if no tokens', async () => {
      expect.assertions(2);

      expect(tokensModule.userTokens).toEqual({});

      await tokensModule.removeUserToken({ token: tokens[0] });

      expect(userService.removeToken).not.toBeCalled();
    });

    it('should not do anything if target token is not exist in state', async () => {
      expect.assertions(3);

      await tokensModule.setUserTokens(tokensNetBySymbols);

      expect(tokensModule.userTokens).toEqual(tokensNetByAddress);

      await tokensModule.removeUserToken({
        token: {
          address: '0x123',
        },
      });

      expect(tokensModule.userTokens).toEqual(tokensNetByAddress);
      expect(userService.removeToken).not.toBeCalled();
    });

    it('should remove user token if it is exist in state', async () => {
      expect.assertions(3);

      await tokensModule.setUserTokens(tokensNetBySymbols);

      expect(tokensModule.userTokens).toEqual(tokensNetByAddress);

      await tokensModule.removeUserToken({ token: tokens[0] });

      const passedToken = tokens[1];

      expect(tokensModule.userTokens).toEqual({
        1: {
          [passedToken.address]: passedToken,
        },
      });
      expect(userService.removeToken).toBeCalledWith(
        Network.NET_ID.MAIN,
        Token.getConsistent(tokens[0]).address,
      );
    });
  });

  describe('addUserToken', () => {
    it('should add user token if it is not exist in state', async () => {
      expect.assertions(3);

      expect(tokensModule.userTokens).toEqual({});

      const passedToken = Token.getConsistent(tokens[0]);
      await tokensModule.addUserToken({
        token: passedToken,
      });

      expect(tokensModule.userTokens).toEqual({
        1: {
          [passedToken.address]: passedToken,
        },
      });
      expect(userService.addToken).toBeCalledWith(
        Network.NET_ID.MAIN,
        passedToken,
      );
    });

    it('should not add user token if it is exist in state ', async () => {
      expect.assertions(3);

      await tokensModule.setUserTokens(tokensNetBySymbols);

      expect(tokensModule.userTokens).toEqual(tokensNetByAddress);

      const passedToken = Token.getConsistent(tokens[0]);
      await tokensModule.addUserToken({
        token: passedToken,
      });

      expect(userService.addToken).not.toBeCalled();
      expect(tokensModule.userTokens).toEqual(tokensNetByAddress);
    });

    it('should handle error ', async () => {
      expect.assertions(3);

      expect(tokensModule.userTokens).toEqual({});

      const error = new Error();
      userService.addToken.mockRejectedValueOnce(error);
      const mock = jest.fn();
      errorsModule.errorEmitter.once('error', mock);

      await tokensModule.addUserToken({ token: tokens[0] });

      expect(tokensModule.userTokens).toEqual({});
      expect(mock).toBeCalled();
    });
  });

  describe('getters', () => {
    it('should returns current account tokens by fullTokensByAddress', async () => {
      expect.assertions(1);

      await tokensModule.setUserTokens(tokensNetBySymbols);

      expect(tokensModule.currentNetUserFullTokens).toEqual({
        '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144': {
          address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
          balance: '0',
          decimals: 18,
          logo: 'http://images.com/img/FST.png',
          name: 'First Token',
          price: '0',
          symbol: 'FST',
        },
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498': {
          address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
          balance: '0',
          decimals: 8,
          logo: '',
          name: 'second token',
          price: '0',
          symbol: 'SCDT',
        },
      });
    });

    it('should returns current account tokens by currentAccountFullTokens', async () => {
      expect.assertions(1);

      await tokensModule.setTokensInfoByAddress({ address, tokens });

      expect(tokensModule.currentAccountFullTokens).toEqual({
        '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144': {
          address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
          balance: '0',
          decimals: 18,
          logo: 'http://images.com/img/FST.png',
          name: 'First Token',
          price: {
            USD: '1',
          },
          symbol: 'FST',
        },
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498': {
          address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
          balance: '0',
          decimals: 8,
          logo: '',
          name: 'second token',
          price: {
            USD: '0.01',
          },
          symbol: 'SCDT',
        },
      });
    });

    it('should return allCurrentAccountFullTokens', async () => {
      await tokensModule.setTokensInfoByAddress({ address, tokens });

      expect(tokensModule.allCurrentAccountFullTokens).toEqual({
        '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144': {
          address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
          balance: '0',
          decimals: 18,
          logo: 'http://images.com/img/FST.png',
          name: 'First Token',
          price: {
            USD: '1',
          },
          symbol: 'FST',
        },
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498': {
          address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
          balance: '0',
          decimals: 8,
          logo: '',
          name: 'second token',
          price: {
            USD: '0.01',
          },
          symbol: 'SCDT',
        },
      });
    });

    it('should return currentAccountTokensCurrencies', async () => {
      await tokensModule.setTokensInfoByAddress({ address, tokens });

      expect(tokensModule.currentAccountTokensCurrencies).toEqual([
        {
          key: 'ETH',
          text: 'ETH',
          val: null,
        },
      ]);
    });
  });
});
