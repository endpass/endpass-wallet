import { NotificationError } from '@/class';

export default class LocalStorage {
  Global = typeof window !== 'undefined' ? window : global;

  read(prop) {
    return Promise.resolve()
      .then(() => this.Global.localStorage.getItem(prop))
      .then(val => {
        if (val !== null) {
          try {
            return JSON.parse(val);
          } catch (e) {}
        }

        return val;
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't read data from local storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  readAll() {
    const result = {};

    return Promise.resolve()
      .then(() => {
        Object.keys(this.Global.localStorage).forEach(key => {
          let val = this.Global.localStorage.getItem(key);

          if (val !== null) {
            try {
              val = JSON.parse(val);
            } catch (e) {}
          }

          result[key] = val;
        });

        return result;
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't read data from local storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  write(prop, data) {
    return Promise.resolve()
      .then(() => JSON.stringify(data))
      .then(strData => this.Global.localStorage.setItem(prop, strData))
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't save data to local storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  writeBulk(dataObj) {
    return Promise.resolve()
      .then(() => {
        Object.keys(dataObj).forEach(prop => {
          const strData = JSON.stringify(dataObj[prop]);
          return this.Global.localStorage.setItem(prop, strData);
        });
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't save data to local storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  remove(prop) {
    return Promise.resolve()
      .then(() => this.Global.localStorage.removeItem(prop))
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text:
            "Can't remove data from local storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  clear() {
    return Promise.resolve()
      .then(() => this.Global.localStorage.clear())
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't clear local storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }
}
