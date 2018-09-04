import { CustomProvider, LocalProvider, ServerProvider } from './provider';
import { ParametersDecorator } from './decorator';
import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';
import { IDENTITY_MODE } from '@/constants';

export default class ProxyRequest {
  constructor(type, serverUrl) {
    this.setMode(type, serverUrl);
  }

  setDecorators(decorators) {
    this.decorators = decorators;
  }

  setMode(type = IDENTITY_MODE.DEFAULT, serverUrl) {
    const url = serverUrl || identityAPIUrl;

    switch (type) {
      case IDENTITY_MODE.CUSTOM:
        this.provider = new CustomProvider(url);
        break;

      case IDENTITY_MODE.LOCAL:
        this.provider = new LocalProvider(url);
        break;

      default:
        this.provider = new ServerProvider(url);
        break;
    }

    const decorators = [new ParametersDecorator(this.provider)];
    this.setDecorators(decorators);
  }

  decorate(params = {}) {
    return this.decorators.reduce(
      (resultParams, decorator) => decorator.decorate(resultParams),
      params,
    );
  }

  async request(params = {}) {
    try {
      const newParams = this.decorate(params);
      const { method } = newParams;

      return await this.provider[method](newParams);
    } catch (e) {
      if (
        (e.response && e.response.status === 401) ||
        e instanceof NotificationError
      ) {
        throw e;
      }

      throw new NotificationError({
        title: e.title,
        text: e.text,
        type: e.type,
      });
    }
  }
}
