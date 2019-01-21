import { isEmpty } from 'lodash';
import Web3 from 'web3';
import getDebounceProviderClass from './DebounceProvider';
import getSubscriptionProviderClass from './SubscriptionProvider';
import getMockProviderClass from './MockProvider';
import providerMixin from './providerMixin';
import composeProviderClass from './composeProviders';

export default class ProviderFactory {
  static getProviderClass(url) {
    const { HttpProvider, WebsocketProvider, IpcProvider } = Web3.providers;

    HttpProvider.prototype.sendAsync = HttpProvider.prototype.send;
    WebsocketProvider.prototype.sendAsync = WebsocketProvider.prototype.send;
    IpcProvider.prototype.sendAsync = IpcProvider.prototype.send;

    switch (true) {
      case url.indexOf('http') === 0:
        return composeProviderClass(
          HttpProvider,
          getDebounceProviderClass,
          getSubscriptionProviderClass,
        );

      case url.indexOf('ws') === 0:
        return composeProviderClass(
          WebsocketProvider,
          getDebounceProviderClass,
        );

      case url.indexOf('.ipc') > 0:
        return composeProviderClass(IpcProvider, getDebounceProviderClass);

      default:
        throw new Error('Invalid url or path parameter for the provider');
    }
  }

  static getInstance(url) {
    const BaseProvider = ProviderFactory.getProviderClass(url);
    const Provider = window.Cypress
      ? getMockProviderClass(BaseProvider)
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
