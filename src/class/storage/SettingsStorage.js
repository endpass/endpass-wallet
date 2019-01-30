import { pick } from 'lodash';
import {
  STORAGE_USER_META_KEY,
  AVAILABLE_USER_META_PROPS,
} from '@/class/constants';

class SettingsStorage {
  constructor({ storage }) {
    if (!storage) {
      throw new Error('Settings storage can not be created without storage!');
    }

    this.storage = storage;

    this.save = this.save.bind(this);
    this.load = this.load.bind(this);
    this.clear = this.clear.bind(this);
  }

  /* eslint-disable-next-line */
  getStorageKey(key) {
    return `${key}:${STORAGE_USER_META_KEY}`;
  }

  save(key, meta) {
    if (!this.storage.save) {
      throw new Error('Provided storage does not implements save method!');
    }

    const pickedMeta = pick(meta, AVAILABLE_USER_META_PROPS);

    this.storage.save(this.getStorageKey(key), pickedMeta);
  }

  load(key) {
    if (!this.storage.load) {
      throw new Error('Provided storage does not implements load method!');
    }

    return this.storage.load(this.getStorageKey(key));
  }

  clear(key) {
    if (!this.storage.remove) {
      throw new Error('Provided storage does not implements remove method!');
    }

    this.storage.remove(this.getStorageKey(key));
  }
}

export default SettingsStorage;
