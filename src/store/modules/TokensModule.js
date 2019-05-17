import { Module, Mutation, Action } from 'vuex-class-modules';
import VuexModuleWithRoot from '@/store/class/VuexModuleWithRoot';
import { Network } from '@endpass/class';
import { cryptoDataService, tokenInfoService, userService } from '@/services';
import { mapArrayByProp } from '@endpass/utils/arrays';
import { NotificationError, Token } from '@/class';
import { get, mapKeys, omit, pick, pickBy } from 'lodash';
import Vue from 'vue';

@Module
class TokensModule extends VuexModuleWithRoot {
  // TODO: add JSDoc for state fields

  prices = {};

  networkTokens = {};

  userTokens = {};

  tokensByAddress = {};

  balancesByAddress = {};

  isLoading = false;

  getActiveNetwork() {
    return this.store.get().state.web3.activeNetwork;
  }

  activeCurrencyName() {
    return this.store.get().state.web3.activeCurrency.name;
  }

  userTokenByAddress(tokenAddress) {
    const targetNetTokens = this.userTokens[this.getActiveNetwork()];

    if (!targetNetTokens) {
      return null;
    }

    return targetNetTokens[tokenAddress] || null;
  }

  tokensByAddressBlock(address) {
    const tokensList = this.tokensByAddress[address];

    if (!tokensList) {
      return {};
    }

    return pick(this.networkTokens, tokensList);
  }

  fullTokens (address, tokens) {
    const balances = getters.balancesByAddress(address);

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

  userTokensWithToken({ net, token }) {
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

  userTokensWithoutToken({ net, token }) {
    const { userTokens } = this;
    const targetNet = userTokens[net];

    if (targetNet) {
      const { [token.address]: removedToken, ...updatedTokens } = targetNet;

      return {
        ...userTokens,
        [net]: updatedTokens,
      };
    }

    return userTokens;
  }

  allCurrentAccountTokensWithNonZeroBalance () {
    return pickBy(this.allCurrentAccountFullTokens, ({ balance }) =>
      Boolean(parseFloat(balance)),
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

  @Action
  async addUserToken({ token }) {
    try {
      const consistentToken = Token.getConsistent(token);

      if (this.userTokenByAddress(consistentToken.address)) return;

      const net = this.getActiveNetwork();
      const updatedTokens = this.userTokensWithToken({
        token: consistentToken,
        net,
      });

      await userService.addToken(net, consistentToken);

      this.updateUserTokens(updatedTokens);
    } catch (err) {
      this.modules.error.emitError(err);
    }
  }

  @Action
  async removeUserToken({ token }) {
    try {
      const consistentToken = Token.getConsistent(token);

      const currentNet = this.getActiveNetwork();
      const currentTokens = this.userTokens[currentNet] || {};
      if (!currentTokens[token.address]) return;

      const netId = currentNet;
      const updatedTokens = this.userTokensWithoutToken({
        net: netId,
        token: consistentToken,
      });

      await userService.removeToken(netId, consistentToken.address);

      this.updateUserTokens(updatedTokens);
    } catch (err) {
      this.modules.error.emitError(err);
    }
  }

  @Action
  async getNetworkTokens() {
    const isMainNetwork = this.getActiveNetwork() === Network.NET_ID.MAIN;

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
      this.modules.error.emitError(error);
    } finally {
      this.setLoading(false);
    }
  }

  @Action
  async getTokensPrices({ tokensSymbols }) {
    if (tokensSymbols.length === 0) return;

    try {
      const prices = await cryptoDataService.getSymbolsPrices(
        tokensSymbols,
        this.activeCurrencyName(),
      );

      this.setTokenPrices(prices);
    } catch (err) {
      this.setTokenPrices({});
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

  async setUserTokens(tokens) {
    const currentNetwork = this.getActiveNetwork();

    if (get(tokens, currentNetwork)) {
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
  }

  @Action
  async init() {
    await this.getNetworkTokens();
  }
}

export default TokensModule;
