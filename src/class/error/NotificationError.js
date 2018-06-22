export default class NotificationError {
  constructor({ title, message, text, type = 'is-info' }) {
    if (!title) {
      throw new Error('Notification error needs a title');
    }

    if (!text && !message) {
      throw new Error('Notification error needs a text or message');
    }

    this.name = this.constructor.name;
    this.title = title;
    this.message = message || text;
    this.text = text || message;
    this.type = type;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

NotificationError.prototype = Object.create(Error.prototype);
NotificationError.prototype.constructor = NotificationError;
