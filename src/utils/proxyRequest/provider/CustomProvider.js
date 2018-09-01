import { http } from '@/utils';
import LocalProvider from './LocalProvider';
import ServerProvider from './ServerProvider';
import { NotificationError } from '@/class';

export default class CustomProvider {
  constructor(serverUrl) {
    this.url = serverUrl;
    this.localProvider = new LocalProvider(serverUrl);
    this.serverProvider = new ServerProvider(serverUrl);
  }

  add(params) {
    const { url } = params;

    if (url.includes('/account')) {
      throw new NotificationError({
        title: 'Error saving account',
        text: 'Not allowed to save account in current mode',
        type: 'is-warning',
      });
    }

    return this.localProvider.add(params);
  }

  async readProp(params) {
    const { prop } = params;
    const data = await this.read(params);

    return data[prop];
  }

  async read(params) {
    const { url } = params;

    if (url.includes('/account')) {
      return this.serverProvider.read(params);
    }

    return this.localProvider.read(params);
  }

  writeProp(params) {
    const { url } = params;

    if (url.includes('/account')) {
      throw new NotificationError({
        title: 'Error saving account',
        text: 'Not allowed to save account in current mode',
        type: 'is-warning',
      });
    }

    return this.localProvider.writeProp(params);
  }

  write(params) {
    const { url } = params;

    if (url.includes('/account')) {
      throw new NotificationError({
        title: 'Error saving account',
        text: 'Not allowed to save account in current mode',
        type: 'is-warning',
      });
    }

    return this.localProvider.write(params);
  }

  remove = async params => {
    try {
      const { url, payload } = params;
      const { data } = await http.delete(url, payload);

      return data;
    } catch (e) {
      e.title = 'Error in server storage';
      e.text =
        "Can't remove data from server storage, maybe it is not available";
      e.type = 'is-warning';

      throw e;
    }
  };

  clear = () => Promise.resolve({ success: true });
}
