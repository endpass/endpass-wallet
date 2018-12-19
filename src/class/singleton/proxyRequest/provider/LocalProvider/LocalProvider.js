import NotificationError from '@/class/error/NotificationError';
import { PROXY_REQUEST_PREFIX } from '@/constants';
import { Decorator, PrefixUrlDecorator } from '../../decorator/index';

async function setDatabase(url) {
  const mod = await import(`./Database`);
  const Database = mod.default;
  const instance = new Database(url);
  await instance.initRoutes();
  return instance;
}

export default class LocalProvider {
  constructor(serverUrl) {
    const decorators = [new PrefixUrlDecorator(PROXY_REQUEST_PREFIX)];
    this.decorator = new Decorator(decorators);
    this.url = serverUrl;
  }

  async request(params) {
    const { method } = params;
    const newParams = this.decorator.decorate(params);

    if (!this.database) {
      this.database = await setDatabase(this.url);
    }

    return this[method](newParams);
  }

  async add(params) {
    try {
      await this.database.request(params);

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local database',
        text: "Can't save data to local database, maybe it is not available",
        type: 'is-warning',
      });
    }
  }

  async read(params) {
    try {
      return this.database.request(params);
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local database',
        text: "Can't read data from local database, maybe it is not available",
        type: 'is-warning',
      });
    }
  }

  async write(params) {
    try {
      await this.database.request(params);

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local database',
        text: "Can't save data to local database, maybe it is not available",
        type: 'is-warning',
      });
    }
  }

  async remove(params) {
    try {
      await this.database.request(params);

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local database',
        text:
          "Can't remove data from local database, maybe it is not available",
        type: 'is-warning',
      });
    }
  }

  async clear() {
    try {
      await this.database.clear();

      return { success: true };
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local database',
        text:
          "Can't clear data in the local database, maybe it is not available",
        type: 'is-warning',
      });
    }
  }
}
