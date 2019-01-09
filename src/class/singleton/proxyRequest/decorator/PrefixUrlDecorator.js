import { PROXY_REQUEST_PREFIX } from '@/class/constants';

export default class PrefixUrlDecorator {
  constructor(prefix = PROXY_REQUEST_PREFIX) {
    this.prefix = prefix;
  }

  decorate(params) {
    const { url } = params;
    return { ...params, url: `${this.prefix}-${url}` };
  }
}
