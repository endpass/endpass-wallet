import isEmpty from 'lodash/isEmpty';
import Web3 from 'web3';
import DebounceMixin from './mixins/DebounceMixin';
import SubscriptionMixin from './mixins/SubscriptionMixin';
import MockMixin from './mixins/MockMixin';
import applyMixinsToClass from './applyMixinsToClass';

export default class ProviderFactory {
  static getProviderClass(url) {
    const { HttpProvider, WebsocketProvider, IpcProvider } = Web3.providers;

    HttpProvider.prototype.sendAsync = HttpProvider.prototype.send;
    WebsocketProvider.prototype.sendAsync = WebsocketProvider.prototype.send;
    IpcProvider.prototype.sendAsync = IpcProvider.prototype.send;

    switch (true) {
      case /^(http(s?)):\/\//i.test(url):
        return applyMixinsToClass(HttpProvider, [
          DebounceMixin,
          SubscriptionMixin,
        ]);

      case /^(ws(s?)):\/\//i.test(url):
        return applyMixinsToClass(WebsocketProvider, [DebounceMixin]);

      case /\.ipc+$/i.test(url):
        return applyMixinsToClass(IpcProvider, [DebounceMixin]);

      default:
        throw new Error('Invalid url or path parameter for the provider');
    }
  }

  static getInstance(url) {
    const BaseProvider = ProviderFactory.getProviderClass(url);
    const Provider = window.Cypress
      ? applyMixinsToClass(BaseProvider, [MockMixin])
      : BaseProvider;

    return new Provider(url);
  }

  /**
   * Create an instance of a provider with fallback for a given URL(s)
   * @param {String<Url> | Array<String<Url>>} url Provider url
   * @returns {Provider} Provider instance
   */
  static create(url) {
    // For string url
    const [providerUrl, ...fallbackUrls] = [].concat(url);
    const provider = ProviderFactory.getInstance(providerUrl);

    if (!isEmpty(fallbackUrls) && !window.Cypress) {
      provider.getFallbackProviders = () =>
        fallbackUrls.map(urlItem => ProviderFactory.getInstance(urlItem));
    }

    provider.setErrorHandler = handler => {
      if (provider.on) {
        provider.on('error', e => handler(e));
      }
    };

    return provider;
  }
}
