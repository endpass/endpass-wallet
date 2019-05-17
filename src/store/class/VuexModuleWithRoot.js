import { VuexModule } from 'vuex-class-modules';

export default class VuexModuleWithRoot extends VuexModule {
  modules = {};

  store = {};

  constructor(props, modules) {
    super(props);

    this.store = {
      get: () => props.store,
    };

    this.modules = modules;
  }
}
