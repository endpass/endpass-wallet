import Web3 from 'web3';
import DebounceProvider from './DebounceProvider';
import MockProvider from './MockProvider';
import providerMixin from './providerMixin';

const { HttpProvider, WebsocketProvider, IpcProvider } = Web3.providers;

HttpProvider.prototype.sendAsync = HttpProvider.prototype.send;
WebsocketProvider.prototype.sendAsync = WebsocketProvider.prototype.send;
IpcProvider.prototype.sendAsync = IpcProvider.prototype.send;

export default url => {
  const AdditionalProvider = window.Cypress ? MockProvider : DebounceProvider;
  let BaseProvider;

  switch (true) {
    case url.indexOf('http') === 0:
      BaseProvider = HttpProvider;
      break;

    case url.indexOf('ws') === 0:
      BaseProvider = WebsocketProvider;
      break;

    case url.indexOf('.ipc') > 0:
      BaseProvider = IpcProvider;
      break;

    default:
      throw 'Invalid url or path parameter for the provider';
  }

  const Provider = providerMixin(BaseProvider, AdditionalProvider);

  // TODO fix provider subscriptions
  return window.Cypress ? new Provider(url) : new BaseProvider(url);
  // return new Provider(url);
};
