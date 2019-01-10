export default class ServerProvider {
  constructor(serverUrl, connection) {
    this.url = serverUrl;
    this.connection = connection;
  }

  request(params) {
    const { method } = params;
    return this[method](params);
  }

  add(params) {
    return this.write(params);
  }

  read = async params => {
    try {
      const { url } = params;
      const { data } = await this.connection.get(url);

      return data;
    } catch (e) {
      e.title = 'Error in server storage';
      e.text = "Can't read data from server storage, maybe it is not available";
      e.type = 'is-warning';

      throw e;
    }
  };

  write = async params => {
    try {
      const { url, payload } = params;
      const { data } = await this.connection.post(url, payload);

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
      const { data } = await this.connection.delete(url, payload);

      return data;
    } catch (e) {
      e.title = 'Error in server storage';
      e.text =
        "Can't remove data from server storage, maybe it is not available";
      e.type = 'is-warning';

      throw e;
    }
  };

  clear = async () => ({ success: true });
}
