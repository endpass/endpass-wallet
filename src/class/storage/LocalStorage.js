/* eslint-disable class-methods-use-this */
export default class LocalStorage {
  static read(prop) {
    return Promise.resolve()
      .then(() => localStorage.getItem(prop))
      .then(val => JSON.parse(val));
  }

  static readAll() {
    return Promise.resolve().then(() =>
      Object.keys(this.Global.localStorage).reduce((acc, key) => {
        const val = localStorage.getItem(key);

        return Object.assign(acc, {
          [key]: val ? JSON.parse(val) : null,
        });
      }, {}),
    );
  }

  static write(prop, data) {
    return Promise.resolve()
      .then(() => JSON.stringify(data))
      .then(strData => localStorage.setItem(prop, strData));
  }

  static writeBulk(dataObj) {
    return Promise.resolve().then(() => {
      Object.keys(dataObj).forEach(prop =>
        localStorage.setItem(prop, JSON.stringify(dataObj[prop])),
      );
    });
  }

  static remove(prop) {
    return Promise.resolve().then(() => localStorage.removeItem(prop));
  }

  static clear() {
    return Promise.resolve().then(() => localStorage.clear());
  }
}
