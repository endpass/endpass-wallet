import { INPAGE_EVENT } from '@/constants';
import EventEmitter from './EventEmitter';

class DappBridge extends EventEmitter {
  constructor(...props) {
    super(props);

    this.setupEventsHandlers();
  }

  setupEventsHandlers() {
    this.on(INPAGE_EVENT.REQUEST, this.handleRequest);
  }

  /* eslint-disable */
  handleRequest(payload) {
    console.log('handler request', payload);
  }
  /* eslint-enable */

  emitResponse(payload) {
    this.emit(INPAGE_EVENT.RESPONSE, payload);
  }

  emitSettings(payload) {
    this.emit(INPAGE_EVENT.SETTINGS, payload);
  }
}

export default new DappBridge();
