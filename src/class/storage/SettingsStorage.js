import { pick } from 'lodash';
import { STORAGE_USER_META_KEY, AVAILABLE_USER_META_PROPS } from '@/constants';

class SettingsStorage {
  constructor({ storage }) {
    if (!storage) {
      throw new Error('Settings storage can not be created without storage!');
    }

    this.storage = storage;
    this.storageKey = `${window.location.host}:${STORAGE_USER_META_KEY}`;

    this.save = this.save.bind(this);
    this.load = this.load.bind(this);
    this.clear = this.clear.bind(this);
  }

  save(meta) {
    if (!this.storage.save) {
      throw new Error('Provided storage does not implements save method!');
    }

    const pickedMeta = pick(meta, AVAILABLE_USER_META_PROPS);

    this.storage.save(this.storageKey, pickedMeta);
  }

  load() {
    if (!this.storage.load) {
      throw new Error('Provided storage does not implements load method!');
    }

    return this.storage.load(this.storageKey);
  }

  clear() {
    if (!this.storage.remove) {
      throw new Error('Provided storage does not implements remove method!');
    }

    this.storage.remove(this.storageKey);
  }
}

export default SettingsStorage;
