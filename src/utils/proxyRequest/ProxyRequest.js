import { CustomProvider, LocalProvider, ServerProvider } from './provider';
import { ParametersDecorator } from './decorator';
import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';

export default class ProxyRequest {
  constructor(mode, serverUrl) {
    this.setMode(mode, serverUrl);
  }

  setDecorators(decorators) {
    this.decorators = decorators;
  }

  setMode(mode = 'default', serverUrl = identityAPIUrl) {
    switch (mode) {
      case 'custom':
        this.provider = new CustomProvider(serverUrl);
        break;

      case 'local':
        this.provider = new LocalProvider(serverUrl);
        break;

      default:
        this.provider = new ServerProvider(serverUrl);
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
      if (e.response && e.response.status === 401) {
        return {};
      }

      if (e instanceof NotificationError) {
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
