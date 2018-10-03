import {
  INPAGE_PROVIDER_SETTINGS_EVENT,
  INPAGE_PROVIDER_REQUEST_EVENT,
  INPAGE_PROVIDER_RESPONSE_EVENT,
  INPAGE_PROVIDER_ERROR_EVENT,
} from './InpageProvider.types';
import { EventEmitter } from '@/class';

export default class InpageProvider {
  constructor(eventEmitter) {
    if (!eventEmitter instanceof EventEmitter)
      throw new Error("Event emitter isn't provided");
    eventEmitter.on(INPAGE_PROVIDER_SETTINGS_EVENT, payload => {
      this.updateSettings(payload);
    });
    eventEmitter.on(INPAGE_PROVIDER_RESPONSE_EVENT, (error, payload) => {
      this.handleResponse(error, payload);
    });
    eventEmitter.on(INPAGE_PROVIDER_ERROR_EVENT, (error, payload) => {
      this.emitError(error, payload);
    });
    this.eventEmitter = eventEmitter;
    this.pendingRequestsHandlers = {};
    this.settings = {};
  }

  handleResponse(error, payload) {
    this.pendingRequestsHandlers[payload.id](error, payload);
  }

  updateSettings({ selectedAddress, networkVersion }) {
    //null is possible responce
    if (typeof selectedAddress !== 'undefined') {
      this.settings.selectedAddress = selectedAddress;
    }

    if (typeof networkVersion !== 'undefined') {
      this.settings.networkVersion = networkVersion;
    }
  }

  emitError(error, payload) {
    this.pendingRequestsHandlers[payload.id](error, payload);
    throw error;
  }

  sendAsync(payload, callback) {
    this.pendingRequestsHandlers[payload.id] = callback;
    this.eventEmitter.emit(INPAGE_PROVIDER_REQUEST_EVENT, payload);
  }

  isConnected() {
    return true;
  }

  send(payload) {
    let result = null;
    switch (payload.method) {
      case 'eth_accounts':
        selectedAddress = this.stateProvider.selectedAddress;
        result = selectedAddress ? [selectedAddress] : [];
        break;

      case 'eth_coinbase':
        selectedAddress = this.stateProvider.selectedAddress;
        result = selectedAddress || null;
        break;

      case 'eth_uninstallFilter':
        this.sendAsync(payload, noop);
        result = true;
        break;

      case 'net_version':
        const networkVersion = this.stateProvider.networkVersion;
        result = networkVersion || null;
        break;
    }

    // return the result
    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result: result,
    };
  }
}
