import debounce from 'lodash.debounce';

export default class DebounceProvider {
  constructor() {
    this.cache = {};
    this.intervalTime = 10000;
    this.parent = null;
    this.interval = this.cleanCache();
  }

  send(...args) {
    return this.updateCacheAndSend(args, 'send');
  }

  sendAsync(...args) {
    return this.updateCacheAndSend(args, 'sendAsync');
  }

  updateCacheAndSend(args, method) {
    const { id, ...rest } = args[0];
    const payloadStr = JSON.stringify(rest);
    const cacheKey = this.toHashString(payloadStr);

    if (this.cache && this.cache[cacheKey] && this.cache[cacheKey].func) {
      this.cache[cacheKey].date = new Date();
    } else {
      const send = (...args) => this.parent[method](...args);
      const func = debounce(send, 1000, { maxWait: 1000 });

      this.cache[cacheKey] = {
        date: new Date(),
        func,
      };
    }

    return this.cache[cacheKey].func(...args);
  }

  toHashString(str) {
    var hash = 0,
      i,
      chr;
    if (this.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash.toString();
  }

  cleanCache() {
    const { intervalTime } = this;

    return setInterval(() => {
      const now = new Date();

      Object.keys(this.cache).forEach(cacheItem => {
        const { date } = this.cache[cacheItem];
        const expirationTime = new Date(date.getTime() + intervalTime);

        if (now > expirationTime) {
          delete this.cache[cacheItem];
        }
      });
    }, intervalTime);
  }

  destroy() {
    clearInterval(this.interval);
  }
}
