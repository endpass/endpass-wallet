import { get, identity } from 'lodash';
import Web3 from 'web3';
import DebounceProvider from './DebounceProvider';
import MockProvider from './MockProvider';
import providerMixin from './providerMixin';

export default class ProviderFactory {
  static getProviderClass(url) {
    const { HttpProvider, WebsocketProvider, IpcProvider } = Web3.providers;

    HttpProvider.prototype.sendAsync = HttpProvider.prototype.send;
    WebsocketProvider.prototype.sendAsync = WebsocketProvider.prototype.send;
    IpcProvider.prototype.sendAsync = IpcProvider.prototype.send;

    switch (true) {
      case url.indexOf('http') === 0:
        return HttpProvider;

      case url.indexOf('ws') === 0:
        return WebsocketProvider;

      case url.indexOf('.ipc') > 0:
        return IpcProvider;

      default:
        throw new Error('Invalid url or path parameter for the provider');
    }
  }

  static getInstance(url) {
    const AdditionalProvider = window.Cypress ? MockProvider : DebounceProvider;
    const BaseProvider = ProviderFactory.getProviderClass(url);
    const Provider = providerMixin(BaseProvider, AdditionalProvider);

    // TODO fix provider subscriptions
    return window.Cypress ? new Provider(url) : new BaseProvider(url);
  }

  // (urlOrObject: { HTTP: String, WS?: String } | String) => Provider
  static create(urlOrObject) {
    const fallbackNetUrl = get(urlOrObject, 'HTTP') || urlOrObject;
    const netUrl = get(urlOrObject, 'WS') || fallbackNetUrl;
    const provider = ProviderFactory.getInstance(netUrl);

    provider.getFallbackProvider = () =>
      ProviderFactory.getInstance(fallbackNetUrl);

    provider.errorHandler = identity;
    provider.setErrorHandler = handler => {
      provider.errorHandler = handler;
    };

    if (provider.on) {
      provider.on('error', e => provider.errorHandler(e));
    }

    return provider;
  }
}
