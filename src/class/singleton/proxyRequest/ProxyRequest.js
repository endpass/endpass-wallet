import { Decorator, ProviderUrlDecorator } from './decorator';
import { NotificationError } from '../../internal';
import { IDENTITY_MODE } from './provider/identityModes';
import { createProvider } from './provider';

export default class ProxyRequest {
  constructor(connection) {
    this.decorator = new Decorator();
    this.connection = connection;
    this.setMode();
  }

  setMode(type = IDENTITY_MODE.DEFAULT, url = ENV.identityAPIUrl) {
    this.provider = createProvider(type, url, this.connection);

    const decorators = [new ProviderUrlDecorator(url)];
    this.decorator.setDecorators(decorators);
  }

  async request(params = {}) {
    if (!this.provider) {
      throw new Error(
        'Provider is not defined, please .setMode() before call request',
      );
    }
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
