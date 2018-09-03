export default class Synchronizer {
  constructor(storage, state, modules = []) {
    this.restore = this.restore.bind(this);
    this.backup = this.backup.bind(this);
    this.listen = this.listen.bind(this);

    if (!storage) {
      throw new Error(
        'You must pass storage instance as first parameter to Synchronizer instance!',
      );
    } else if (!state) {
      throw new Error(
        'You must pass state as second parameter to Synchronizer instance!',
      );
    }

    this.storageKey = 'endpass-local-sync';
    this.backupHandler = null;
    this.storage = storage;
    this.state = state;
    this.modules = modules;
  }

  /**
   * Saves data of modules by given name in modules parameter to given storage
   */
  async backup() {
    const { state, modules } = this;

    if (modules.length > 0) {
      await this.storage.write(
        this.storageKey,
        Object.keys(state).reduce((acc, key) => {
          if (modules.includes(key)) {
            Object.assign(acc, {
              [key]: state[key],
            });
          }

          return acc;
        }, {}),
      );
    }
  }

  /**
   * Read data by storageKey (hardcoded in Synchronizer constructor) and calls backupHandler that
   * sets by listen method
   */
  async restore() {
    if (this.backupHandler) {
      const data = await this.storage.read(this.storageKey);

      this.backupHandler(data);
    }
  }

  /**
   * Clears sync data in given storage
   */
  async reset() {
    await this.storage.remove(this.storageKey);
  }

  /**
   * Sets listener to Synchronizer instance for next calls after restore
   * @param {Function} handler Listener function
   */
  listen(handler) {
    this.backupHandler = handler;
  }
}
