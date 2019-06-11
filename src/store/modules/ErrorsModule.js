import { Module, Action } from 'vuex-class-modules';
import { EventEmitter } from '@/class';

import VuexModuleWithRoot from '@/store/class/VuexModuleWithRoot';

@Module
class ErrorsModule extends VuexModuleWithRoot {
  errorEmitter = new EventEmitter();

  @Action
  emitError(error) {
    if (error.apiError) {
      this.modules.connectionStatus.updateApiErrorStatus(error.apiError);
    }
    this.errorEmitter.emit('error', error);
  }
}

export default ErrorsModule;
