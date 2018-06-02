export default class LocalStorage {
  Global = typeof window !== 'undefined' ? window : global;

  read(prop) {
    return Promise.resolve()
      .then(() => this.Global.localStorage.getItem(prop))
      .then(val => {
        if (val !== null) {
          return JSON.parse(val);
        }

        return val;
      })
      .catch(e => {
        console.error(e);
        const title = 'Error in local storage';
        const text =
          "Can't save data to local storage, maybe it is not available";
        const error = Object.assign(e, { title, text });

        throw error;
      });
  }

  write(prop, data) {
    return Promise.resolve()
      .then(() => JSON.stringify(data))
      .then(strData => this.Global.localStorage.setItem(prop, strData))
      .catch(e => {
        console.error(e);
        throw e;
      });
  }

  remove(prop) {
    return Promise.resolve()
      .then(() => this.Global.localStorage.removeItem(prop))
      .catch(e => {
        console.error(e);
        throw e;
      });
  }

  clear() {
    return Promise.resolve()
      .then(() => this.Global.localStorage.clear())
      .catch(e => {
        console.error(e);
        throw e;
      });
  }
}
