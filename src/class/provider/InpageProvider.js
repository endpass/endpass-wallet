import { EventEmitter } from '@/class';
import { INPAGE_EVENT, INPAGE_ID_PREFIX } from '@/constants';

export default class InpageProvider {
  constructor(eventEmitter) {
    if (!(eventEmitter instanceof EventEmitter)) {
      throw new Error("Event emitter isn't provided");
    }

    eventEmitter.on(INPAGE_EVENT.SETTINGS, payload => {
      this.updateSettings(payload);
    });
    eventEmitter.on(INPAGE_EVENT.RESPONSE, payload => {
      this.handleResponse(payload);
    });
    this.eventEmitter = eventEmitter;
    this.pendingRequestsHandlers = {};
    this.settings = {};
  }

  handleResponse({ error, id, result }) {
    const trxId = id.replace(INPAGE_ID_PREFIX, '');

    console.log('response', this.pendingRequestsHandlers, id, result);

    this.pendingRequestsHandlers[trxId](error, {
      id: trxId,
      result,
    });
    delete this.pendingRequestsHandlers[trxId];
  }

  updateSettings({ selectedAddress, networkVersion }) {
    if (typeof selectedAddress !== 'undefined') {
      this.settings.selectedAddress = selectedAddress;
    }

    if (typeof networkVersion !== 'undefined') {
      this.settings.networkVersion = networkVersion;
    }
  }

  processPayload(payload) {
    let result = null;

    switch (payload.method) {
      case 'eth_accounts':
        result = this.settings.selectedAddress
          ? [this.settings.selectedAddress]
          : [];
        break;
      case 'eth_coinbase':
        result = this.settings.selectedAddress || null;
        break;
      case 'eth_uninstallFilter':
        this.sendAsync(payload, () => {});
        result = true;
        break;
      case 'net_version':
        result = this.settings.networkVersion || null;
        break;
      default:
        break;
    }

    // return the result
    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result,
    };
  }

  sendAsync(payload, callback) {
    const processedPayload = this.processPayload({ ...payload });

    if (processedPayload.result !== null) {
      callback(null, processedPayload);
    } else {
      console.log('send async', payload);

      this.pendingRequestsHandlers[payload.id] = callback;
      this.eventEmitter.emit(INPAGE_EVENT.REQUEST, {
        ...payload,
        id: `${INPAGE_ID_PREFIX}${payload.id}`,
      });
    }
  }

  send(payload) {
    console.log('send', payload);

    return this.processPayload(payload);
  }

  isConnected() {
    return true;
  }
}
