import { debounce } from 'lodash';

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

    if (this.cache[cacheKey] && this.cache[cacheKey].func) {
      this.cache[cacheKey].date = new Date();
      this.cache[cacheKey].buffer.push(args);
    } else {
      const send = (...args) => {
        this.parent[method](args[0], (e, result) => {
          if (!(this.cache[cacheKey] && this.cache[cacheKey].buffer)) {
            return;
          }

          const dfdArr = [...this.cache[cacheKey].buffer];
          this.cache[cacheKey].buffer = [];
          this.cache[cacheKey].func = null;
          dfdArr.forEach(([payload, callback]) => {
            const { id } = payload;
            callback(e, { ...result, id });
          });
        });
      };
      const func = debounce(send, 1000, { maxWait: 1000 });

      this.cache[cacheKey] = {
        date: new Date(),
        func,
        buffer: [args],
      };
    }

    return this.cache[cacheKey].func(...args);
  }

  toHashString(str) {
    let hash = 0;
    let i;
    let chr;

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
    this.cache = null;
    clearInterval(this.interval);
  }
}
