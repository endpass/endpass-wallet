import LocalProvider from './LocalProvider';
import ServerProvider from './ServerProvider';
import NotificationError from '@/class/error/NotificationError';

const error = new NotificationError({
  title: 'Error saving account',
  text: 'Not allowed to save account in current mode',
  type: 'is-warning',
});

export default class CustomProvider {
  constructor(serverUrl) {
    this.url = serverUrl;
    this.localProvider = new LocalProvider();
    this.serverProvider = new ServerProvider(serverUrl);
  }

  request(params) {
    const { method } = params;
    return this[method](params);
  }

  localProviderRequest(params) {
    const { method, url } = params;

    if (url.includes('/account')) {
      throw error;
    }

    return this.localProvider[method](params);
  }

  add(params) {
    return this.localProviderRequest(params);
  }

  async read(params) {
    const { url } = params;

    if (url.includes('/account')) {
      return this.serverProvider.read(params);
    }

    return this.localProvider.read(params);
  }

  write(params) {
    return this.localProviderRequest(params);
  }

  remove(params) {
    return this.localProvider.remove(params);
  }

  clear = async () => ({ success: true });
}
