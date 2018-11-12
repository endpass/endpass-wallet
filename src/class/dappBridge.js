import { INPAGE_EVENT } from '@/constants';
import EventEmitter from './EventEmitter';

class DappBridge extends EventEmitter {
  constructor(...props) {
    super(props);

    this.messageHandler = null;
    this.setupEventsHandlers();
  }

  setupEventsHandlers() {
    this.on(INPAGE_EVENT.REQUEST, this.handleMessage);
    this.on(INPAGE_EVENT.SETTINGS, this.handleMessage);
  }

  setMessageHandler(handler) {
    this.messageHandler = handler;
  }

  handleMessage(payload) {
    if (this.messageHandler) {
      this.messageHandler(payload);
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
