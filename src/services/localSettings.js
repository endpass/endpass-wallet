import { LocalStorage, SettingsStorage } from '@/class';

const settingsStorage = new SettingsStorage({ storage: LocalStorage });

export default {
  save: settingsStorage.save,

  load: settingsStorage.load,

  clear: settingsStorage.clear,
};
