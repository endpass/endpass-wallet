import { CustomProvider, LocalProvider, ServerProvider } from './provider';
import { Decorator, ProviderUrlDecorator } from './decorator';
import { NotificationError } from '@/class';
import { IDENTITY_MODE } from '@/constants';

export default class ProxyRequest {
  constructor(type, serverUrl) {
    this.decorator = new Decorator();
    this.setMode(type, serverUrl);
  }

  setMode(type = IDENTITY_MODE.DEFAULT, serverUrl) {
    const url = serverUrl || ENV.identityAPIUrl;

    switch (type) {
      case IDENTITY_MODE.CUSTOM:
        this.provider = new CustomProvider(url);
        break;

      case IDENTITY_MODE.LOCAL:
        this.provider = new LocalProvider(url);
        break;

      default:
        this.provider = new ServerProvider(url);
    }

    const decorators = [new ProviderUrlDecorator(url)];
    this.decorator.setDecorators(decorators);
  }

  async request(params = {}) {
    try {
      const newParams = this.decorator.decorate(params);
      return await this.provider.request(newParams);
    } catch (e) {
      if (e.response || e instanceof NotificationError) {
        throw e;
      }

      throw new NotificationError({
        title: e.title,
        text: e.text,
        type: e.type,
      });
    }
  }

  add(url, params) {
    return this.request({
      ...params,
      method: 'add',
      url,
    });
  }

  read(url, params) {
    return this.request({
      ...params,
      method: 'read',
      url,
    });
  }

  write(url, params) {
    return this.request({
      ...params,
      method: 'write',
      url,
    });
  }

  remove(url, params) {
    return this.request({
      ...params,
      method: 'remove',
      url,
    });
  }

  clear() {
    return this.request({
      method: 'clear',
    });
  }
}
