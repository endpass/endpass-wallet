import { INPAGE_EVENT } from '@/constants';
import EventEmitter from './EventEmitter';

class DappBridge extends EventEmitter {
  constructor(...props) {
    super(props);

    this.requestHandler = null;
    this.setupEventsHandlers();
  }

  setupEventsHandlers() {
    this.on(INPAGE_EVENT.REQUEST, this.handleRequest);
    this.on(INPAGE_EVENT.SETTINGS, this.handleRequest);
  }

  setRequestHandler(handler) {
    this.requestHandler = handler;
  }

  handleRequest(payload) {
    if (this.requestHandler) {
      this.requestHandler(payload);
    }
  }

  emitResponse(payload) {
    this.emit(INPAGE_EVENT.RESPONSE, payload);
  }

  emitSettings(payload) {
    this.emit(INPAGE_EVENT.SETTINGS, payload);
  }
}

export default new DappBridge();
