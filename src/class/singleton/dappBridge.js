import { INPAGE_EVENT } from '@/constants';
import { EventEmitter } from '@/class';

class DappBridge extends EventEmitter {
  constructor(...props) {
    super(props);

    this.requestHandler = null;
    this.setupEventsHandlers();
  }

  setupEventsHandlers() {
    this.on(INPAGE_EVENT.REQUEST, this.handleRequest.bind(this));
    this.on(INPAGE_EVENT.SETTINGS, this.handleRequest.bind(this));
  }

  setRequestHandler(handler) {
    this.requestHandler = handler;
  }

  handleRequest(payload) {
    if (this.requestHandler && payload.id) {
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
