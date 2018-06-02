export default class Storage {
  store = null;

  constructor(store) {
    this.store = store;
  }

  setStore(store) {
    this.store = store;
  }

  read(prop) {
    return this.store.read(prop);
  }

  write(prop, data) {
    return this.store.write(prop, data);
  }

  remove(prop) {
    return this.store.remove(prop);
  }

  clear() {
    return this.store.clear();
  }
}
