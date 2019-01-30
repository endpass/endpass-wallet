import { STORAGE_USER_META_KEY } from '@/constants';
import { LocalStorage, SettingsStorage } from '@/class';

const settingsStorage = new SettingsStorage({
  storage: LocalStorage,
  storageKey: STORAGE_USER_META_KEY,
});

export default {
  save: settingsStorage.save,

  load: settingsStorage.load,

  clear: settingsStorage.clear,
};
