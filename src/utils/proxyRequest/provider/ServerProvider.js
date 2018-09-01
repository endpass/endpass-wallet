import { http } from '@/utils';

export default class ServerProvider {
  constructor(serverUrl) {
    this.url = serverUrl;
  }

  add(params) {
    return this.write(params);
  }

  readProp = async params => {
    try {
      const { prop } = params;
      const data = await this.read(params);

      return data[prop];
    } catch (e) {
      e.title = 'Error in server storage';
      e.text = "Can't read data from server storage, maybe it is not available";
      e.type = 'is-warning';

      throw e;
    }
  };

  read = async params => {
    try {
      const { url } = params;
      const { data } = await http.get(url);

      return data;
    } catch (e) {
      e.title = 'Error in server storage';
      e.text = "Can't read data from server storage, maybe it is not available";
      e.type = 'is-warning';

      throw e;
    }
  };

  writeProp = async params => {
    try {
      const { url, payload, prop } = params;
      const { data } = await this.write(url, { [prop]: payload });

      return data;
    } catch (e) {
      e.title = 'Error in server storage';
      e.text = "Can't save data to server storage, maybe it is not available";
      e.type = 'is-warning';

      throw e;
    }
  };

  write = async params => {
    try {
      const { url, payload } = params;
      const { data } = await http.post(url, payload);

      return data;
    } catch (e) {
      e.title = 'Error in server storage';
      e.text = "Can't save data to server storage, maybe it is not available";
      e.type = 'is-warning';

      throw e;
    }
  };

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
