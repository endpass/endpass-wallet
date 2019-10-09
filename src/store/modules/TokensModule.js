import { Module, Mutation, Action } from 'vuex-class-modules';
import Network from '@endpass/class/Network';
import { mapArrayByProp } from '@endpass/utils/arrays';
import { get, mapKeys, omit, pick, pickBy, uniq } from 'lodash';
import Vue from 'vue';
import { NotificationError, Token } from '@/class';
import { cryptoDataService, tokenInfoService, userService } from '@/services';
import VuexModuleWithRoot from '@/store/class/VuexModuleWithRoot';

/**
 * @typedef {string} tokenSymbol
 */

/**
 * @typedef {Object<string, number>} price
 */

/**
 * @typedef {string} tokenAddress
 *
 * @example
 * const addr = "0x0000000000085d4780B73119b644AE5ecd22b376";
 */

/**
 * @typedef {string} accountAddress
 */

@Module
class TokensModule extends VuexModuleWithRoot {
  /**
   * @type {Object<tokenSymbol, price>}
   *
   * @example
   *
   * const prices = {
   *   '0xBTC': {"USD":0.01244}
   * }
   *
   */
  prices = {};

  /**
   * @type {Object<tokenAddress, {
   *   address: tokenAddress,
   *   decimals: number,
   *   logo: string,
   *   name: string,
   *   symbol: tokenSymbol
   * }>}
   *
   * @example
   * const tokens = {
   *   "0x0000000000085d4780B73119b644AE5ecd22b376": {
   *     address:"0x0000000000085d4780B73119b644AE5ecd22b376"
   *     decimals:18
   *     logo:"https://tokeninfo-dev.endpass.com/img/0x0000000000085d4780b73119b644ae5ecd22b376.png"
   *     name:"TrueUSD"
   *     symbol:"TUSD"
   *   }
   * }
   */
  networkTokens = {};

  /**
   * {
   * @type {Object<Network.NET_ID, Object<tokenAddress,{
   *     address: tokenAddress
   *     decimals: number
   *     logo: string
   *     name: string
   *     symbol: tokenSymbol
   * }>>}
   *
   * @example
   *
   * const tokens = {
   *   [Network.NET_ID.MAIN]: {
   *     "0x4e84e9e5fb0a972628cf4568c403167ef1d40431": {
   *       address: "0x4e84e9e5fb0a972628cf4568c403167ef1d40431"
   *       decimals:18
   *       hidden:false
   *       logo:""
   *       manuallyAdded:false
   *       name:"$Fluzcoin"
   *       symbol:"$FFC"
   *     }
   *   }
   * }
   */
  userTokens = {};

  /**
   *
   * @type {Object<accountAddress, Array[tokenAddress]>}
   *
   * @example
   *
   * const tokens = {
   *   "0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c": [
   *    '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
   *    '0xE41d2489571d322189246DaFA5ebDe1F4699F498'
   *   ]
   * }
   */
  tokensByAddress = {};

  /**
   * @type {Object<tokenAddress, Object<tokenSymbol, number>>}
   *
   * @example
   *
   * const balances = {
   *  "0x4e84e9e5fb0a972628cf4568c403167ef1d40431": {
   *    FST: '0',
   *    SCDT: '0'
   *  }
   * }
   */
  balancesByAddress = {};

  isLoading = false;

  _getActiveNetwork() {
    return this.store.get().state.web3.activeNet.id;
  }

  _activeCurrencyName() {
    return this.store.get().state.web3.activeCurrency.name;
  }

  _getAccountAddress() {
    return this.store.get().state.accounts.address;
  }

  _isTokenExistByAddress(tokenAddress) {
    const targetNetTokens = this.userTokens[this._getActiveNetwork()];

    if (!targetNetTokens) {
      return null;
    }

    const existTokenAddress =
      Object.keys(targetNetTokens).find(
        address => address.toLowerCase() === tokenAddress,
      ) || null;

    return !!existTokenAddress;
  }

  _tokensByAddressBlock(address) {
    const tokensList = this.tokensByAddress[address];

    if (!tokensList) {
      return {};
    }

    return pick(this.networkTokens, tokensList);
  }

  _fullTokens(address, tokens) {
    const balances = this._balancesByAddressBlock(address);

    return Object.keys(tokens).reduce((acc, key) => {
      const token = tokens[key];

      return Object.assign(acc, {
        [key]: {
          ...token,
          balance: balances[token.symbol] || '0',
          price: this.prices[token.symbol] || '0',
        },
      });
    }, {});
  }

  _balancesByAddressBlock(address) {
    return this.balancesByAddress[address] || {};
  }

  _currentNetUserTokens() {
    return this.userTokens[this._getActiveNetwork()] || {};
  }

  _currentAccountTokens() {
    return this._tokensByAddressBlock(this._getAccountAddress());
  }

  _userTokensWithToken({ net, token }) {
    const { userTokens } = this;
    const targetNet = userTokens[net] || null;

    if (targetNet) {
      return {
        ...userTokens,
        [net]: {
          ...userTokens[net],
          [token.address]: token,
        },
      };
    }

    return {
      ...userTokens,
      [net]: {
        [token.address]: token,
      },
    };
  }

  _userTokensWithoutToken({ net, token }) {
    const { userTokens } = this;
    const targetNetTokens = userTokens[net];

    if (!targetNetTokens) {
      return userTokens;
    }

    const filtered = Object.keys(targetNetTokens)
      .filter(address => address.toLowerCase() !== token.address)
      .reduce(
        (obj, key) => ({
          ...obj,
          [key]: targetNetTokens[key],
        }),
        {},
      );

    return {
      ...userTokens,
      [net]: filtered,
    };
  }

  _allCurrentAccountTokensWithNonZeroBalance() {
    return pickBy(this.allCurrentAccountFullTokens, ({ balance }) =>
      Boolean(parseFloat(balance)),
    );
  }

  _allCurrentAccountTokens() {
    return {
      ...this._currentAccountTokens(),
      ...this._currentNetUserTokens(),
    };
  }

  _fullTokensByAddress(address) {
    const tokens = this._tokensByAddressBlock(address);

    return this._fullTokens(address, tokens);
  }

  get currentNetUserFullTokens() {
    const address = this._getAccountAddress();
    const tokens = this._currentNetUserTokens();

    return this._fullTokens(address, tokens);
  }

  get currentAccountFullTokens() {
    return this._fullTokensByAddress(this._getAccountAddress());
  }

  get allCurrentAccountFullTokens() {
    const address = this._getAccountAddress();
    const tokens = this._allCurrentAccountTokens();

    return this._fullTokens(address, tokens);
  }

  get currentAccountTokensCurrencies() {
    const _activeCurrencyName = this._activeCurrencyName();
    const currencies = [
      {
        val: null,
        key: _activeCurrencyName,
        text: _activeCurrencyName,
      },
    ];

    return uniq(
      currencies.concat(
        Object.values(this._allCurrentAccountTokensWithNonZeroBalance()).map(
          ({ symbol }) => symbol,
        ),
      ),
    );
  }

  @Mutation
  setLoading(val) {
    this.isLoading = val;
  }

  @Mutation
  addNetworkTokens(tokens) {
    // FIXME: potentially slow part. Fix it when tokens will have common index
    Object.keys(tokens).forEach(key => {
      if (!this.networkTokens[key]) {
        Object.assign(this.networkTokens, {
          [key]: Object.freeze(tokens[key]), // Freeze tokens for perfomance reasons
        });
      } else {
        Object.assign(this.networkTokens, {
          [key]: Object.freeze({
            ...this.networkTokens[key],
            ...tokens[key],
          }),
        });
      }
    });
  }

  @Mutation
  updateUserTokens(tokens) {
    this.userTokens = tokens;
  }

  @Mutation
  setTokenPrices(prices) {
    this.prices = {
      ...this.prices,
      ...prices,
    };
  }

  @Mutation
  setBalancesByAddress({ address, balances }) {
    Vue.set(this.balancesByAddress, address, balances);
  }

  @Mutation
  setTokensByAddress({ address, tokens }) {
    Vue.set(this.tokensByAddress, address, tokens);
  }

  get currentAccountTokenBySymbol() {
    return symbol => {
      const token = Object.values(
        this._allCurrentAccountTokensWithNonZeroBalance(),
      ).find(accountToken => accountToken.symbol === symbol);

      if (!token) return null;

      return token;
    };
  }

  @Action
  async addUserToken({ token }) {
    try {
      const consistentToken = Token.getConsistent(token);

      if (this._isTokenExistByAddress(consistentToken.address)) return;

      const net = this._getActiveNetwork();

      await userService.addToken(net, consistentToken);

      const updatedTokens = this._userTokensWithToken({
        token: consistentToken,
        net,
      });

      this.updateUserTokens(updatedTokens);
    } catch (err) {
      this.modules.errors.emitError(err);
    }
  }

  @Action
  async removeUserToken({ token }) {
    try {
      const consistentToken = Token.getConsistent(token);

      const currentNet = this._getActiveNetwork();
      const currentTokens = this.userTokens[currentNet] || {};
      if (!currentTokens[token.address]) return;

      const netId = currentNet;

      await userService.removeToken(netId, consistentToken.address);

      const updatedTokens = this._userTokensWithoutToken({
        net: netId,
        token: consistentToken,
      });

      this.updateUserTokens(updatedTokens);
    } catch (err) {
      this.modules.errors.emitError(err);
    }
  }

  @Action
  async loadNetworkTokens() {
    const isMainNetwork = this._getActiveNetwork() === Network.NET_ID.MAIN;

    if (!isMainNetwork) return;

    try {
      this.setLoading(true);

      const networkTokens = await tokenInfoService.getTokensList();

      this.addNetworkTokens(mapArrayByProp(networkTokens, 'address'));
    } catch (e) {
      const error = new NotificationError({
        title: 'Failed to get list of tokens',
        text:
          'An error occurred while retrieving the list of tokens. Please try again.',
        type: 'is-warning',
      });
      this.modules.errors.emitError(error);
    } finally {
      this.setLoading(false);
    }
  }

  @Action
  async setTokensInfoByAddress({ address, tokens }) {
    const tokensBalances = tokens.reduce(
      (acc, token) =>
        Object.assign(acc, {
          [token.symbol]: token.balance || '0',
        }),
      {},
    );
    const tokensPrices = tokens.reduce(
      (acc, token) =>
        Object.assign(acc, {
          [token.symbol]: token.price || {},
        }),
      {},
    );
    const networkTokens = tokens.reduce(
      (acc, token) =>
        Object.assign(acc, {
          [token.address]: omit(token, ['price', 'balance']),
        }),
      {},
    );

    this.setTokenPrices(tokensPrices);
    this.setBalancesByAddress({
      balances: tokensBalances,
      address,
    });
    this.setTokensByAddress({
      tokens: tokens.map(token => token.address),
      address,
    });
    this.addNetworkTokens(networkTokens);
  }

  @Action
  async setUserTokens(tokens) {
    const currentNetwork = this._getActiveNetwork();
    if (!get(tokens, currentNetwork)) {
      return;
    }

    const { fiatCurrency } = this.modules.price;
    const tokensMappedByNetworksAndAddresses = Object.keys(tokens).reduce(
      (acc, key) =>
        Object.assign(acc, {
          [key]: mapKeys(tokens[key], 'address'),
        }),
      {},
    );
    const currentNetworkTokens = get(
      tokensMappedByNetworksAndAddresses,
      currentNetwork,
    );

    this.updateUserTokens(tokensMappedByNetworksAndAddresses);

    const tokensPrices = await cryptoDataService.getSymbolsPrices(
      Object.keys(currentNetworkTokens).map(
        key => currentNetworkTokens[key].symbol,
      ),
      fiatCurrency,
    );

    this.setTokenPrices(tokensPrices);
  }

  @Action
  async init() {
    await this.loadNetworkTokens();
  }
}

export default TokensModule;
