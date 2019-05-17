import { Module, Mutation, Action } from 'vuex-class-modules';
import { web3 } from '@/class';

import VuexModuleWithRoot from '@/store/class/VuexModuleWithRoot';

@Module
class ConnectionStatusModule extends VuexModuleWithRoot {
  /**
   * Web3 provider state
   * @type {boolean}
   */
  isWeb3Connecting = true;

  /**
   * External api's state
   * @type {boolean}
   */
  isApiConnecting = true;

  /**
   * Is node syncing
   * @type {boolean}
   */
  isSyncing = true;

  /**
   * External api errors for multiple api tracking
   * @type {Array}
   */
  apiErrorsArray = [];

  get appStatus() {
    if (!this.isWeb3Connecting) {
      return 'failed';
    }
    if (this.isSyncing) {
      return 'syncing';
    }
    return 'ready';
  }

  @Mutation
  addErrorId(id) {
    if (this.apiErrorsArray.includes(id)) {
      return;
    }

    this.apiErrorsArray.push(id);
  }

  @Mutation
  removeErrorId(id) {
    const index = this.apiErrorsArray.indexOf(id);
    if (index !== -1) this.apiErrorsArray.splice(index, 1);
  }

  @Mutation
  setApiConnectionStatus(val) {
    this.isApiConnecting = val;
  }

  @Mutation
  setSyncStatus(val) {
    this.isSyncing = val;
  }

  @Mutation
  setWeb3ConnectionStatus(val) {
    this.isWeb3Connecting = val;
  }

  @Action
  async pingSyncStatus() {
    const providerCache = web3.currentProvider;
    let timeout = 0;
    try {
      const status = await web3.eth.isSyncing();

      // don't update anything if provider changed while fetched data
      if (providerCache === web3.currentProvider) {
        this.setSyncStatus(status);
        this.setWeb3ConnectionStatus(true);
        timeout = ENV.VUE_APP_BLOCK_UPDATE_INTERVAL;
      }
    } catch (e) {
      this.setWeb3ConnectionStatus(false);
      this.modules.errors.emitError(e);
      timeout = ENV.VUE_APP_BLOCK_UPDATE_INTERVAL;
    }

    setTimeout(() => {
      this.pingSyncStatus();
    }, timeout);
  }

  @Action
  updateApiErrorStatus({ id, status }) {
    if (status) {
      this.addErrorId(id);
      this.setApiConnectionStatus(status);
    } else {
      this.removeErrorId(id);
      // set connection status to true if no errors left
      if (this.apiErrorsArray.length === 0) {
        this.setApiConnectionStatus(status);
      }
    }
  }

  @Action
  init() {
    this.pingSyncStatus();
  }
}

export default ConnectionStatusModule;
