export default class ModuleRegister {
  /**
   * @param {Object} store Vuex store instance
   */
  constructor(store) {
    this.store = store;
    this.modules = {};
  }

  /**
   * @param {String} name Module name in Vuex store
   * @param {Module} Module class of vuex class modules
   */
  registerModule(name, Module) {
    if (this.modules[name]) {
      throw new Error(`Module "${name}" already registered`);
    }

    const options = {
      store: this.store,
      name,
    };

    const module = new Module(options, this.modules);

    this.modules[name] = module;

    return module;
  }

  /**
   * @param {Object.<String, Module>} [newModules.<String, Module>] Module class map
   * @returns {Object} map An index of modules instance
   */
  registerModules(newModules) {
    return Object.keys(newModules).reduce((map, name) => {
      const module = this.registerModule(name, newModules[name]);

      return Object.assign(map, {
        [name]: module,
      });
    }, {});
  }
}
