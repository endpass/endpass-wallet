import debounce from 'lodash.debounce';
import StubStorage from './StubStorage';

export default class Storage {
  constructor(localStore, remoteStore) {
    this.stubStorage = new StubStorage();
    this.localStore = localStore || this.stubStorage;
    this.remoteStore = remoteStore || this.stubStorage;
    this.isSync = false;
    this.syncStateDebounce = debounce(this.syncState, 1000, {
      leading: true,
      trailing: false,
    });
  }

  async syncState() {
    try {
      const state = await this.remoteStore.readAll();
      await this.localStore.writeBulk(state);
      this.isSync = true;
    } catch (e) {
      throw e;
    }
  }

  async read(prop) {
    if (!this.isSync) {
      await this.syncStateDebounce();
    }

    return await this.localStore.read(prop);
  }

  async readAll() {
    if (!this.isSync) {
      await this.syncStateDebounce();
    }

    return await this.localStore.readAll();
  }

  write(prop, data) {
    return Promise.all([
      this.remoteStore.write(prop, data),
      this.localStore.write(prop, data),
    ]);
  }

  writeBulk(dataObj) {
    return Promise.all([
      this.remoteStore.writeBulk(dataObj),
      this.localStore.writeBulk(dataObj),
    ]);
  }

  remove(prop) {
    return this.localStore.remove(prop);
  }

  clear() {
    return this.localStore.clear();
  }

  disableRemote() {
    this.remoteStore = this.stubStorage;
  }
}
