import { NotificationError } from '@/class';
import { PROXY_REQUEST_PREFIX } from '@/constants';
import { Decorator, PrefixUrlDecorator } from '../decorator';

export default class LocalProvider {
  constructor(serverUrl) {
    const decorators = [new PrefixUrlDecorator(PROXY_REQUEST_PREFIX)];
    this.decorator = new Decorator(decorators);
    this.url = serverUrl;
  }

  request(params) {
    const { method } = params;
    const newParams = this.decorator.decorate(params);

    return this[method](newParams);
  }

  async add(params) {
    try {
      const { url, payload, prop } = params;
      const oldData = await this.read({ url });
      let newData;

      if (oldData && Array.isArray(oldData)) {
        newData = oldData.concat(payload);
      } else if (oldData && typeof oldData === 'object') {
        newData = {
          ...oldData,
          ...payload,
        };
      } else if (prop) {
        newData = {
          [prop]: payload,
        };
      } else {
        newData = [payload];
      }

      const data = JSON.stringify(newData);

      localStorage.setItem(url, data);

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local storage',
        text: "Can't save data to local storage, maybe it is not available",
        type: 'is-warning',
      });
    }
  }

  async read(params) {
    try {
      const { url } = params;

      // If last url param === 'accounts'
      if (url.match(/\/([^\/]+)\/?$/)[1] === 'accounts') {
        return this.getAllAccounts();
      }

      const data = localStorage.getItem(url);

      // If last url param === 'user' -> return default
      if (data === null && url.match(/\/([^\/]+)\/?$/)[1] === 'user') {
        return {};
      }

      if (data === null) {
        throw new Error('Empty');
      }

      try {
        return JSON.parse(data);
      } catch (e) {}

      return data;
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local storage',
        text: "Can't read data from local storage, maybe it is not available",
        type: 'is-warning',
      });
    }
  }

  write = async params => {
    try {
      const { payload } = params;
      const { url } = params;
      const data = JSON.stringify(payload);

      localStorage.setItem(url, data);

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local storage',
        text: "Can't save data to local storage, maybe it is not available",
        type: 'is-warning',
      });
    }
  };

  remove = async params => {
    try {
      const { url } = params;

      localStorage.removeItem(url);

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local storage',
        text: "Can't remove data from local storage, maybe it is not available",
        type: 'is-warning',
      });
    }
  };

  clear = async () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.includes(PROXY_REQUEST_PREFIX))
        .forEach(key => localStorage.removeItem(key));

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local storage',
        text:
          "Can't clear data in the local storage, maybe it is not available",
        type: 'is-warning',
      });
    }
  };

  getAllAccounts = () =>
    Object.keys(localStorage)
      .filter(key => key.includes('/account/') && !/\/info\/?$/.test(key))
      .map(key => key.match(/\/([^\/]+)\/?$/)[1]);
}
