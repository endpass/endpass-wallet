import get from 'lodash/get';
import debounce from 'lodash/debounce';

export default ParentProvider => {
  class DebounceProvider extends ParentProvider {
    constructor(...args) {
      super(...args);
      this.cache = {};
      this.intervalTime = 10000;
      this.cleanCacheDebounced = debounce(this.cleanCache, 10000, {
        maxWait: 1000,
      });
    }

    send(...args) {
      return this.updateCacheAndSend(args, 'send');
    }

    sendAsync(...args) {
      return this.updateCacheAndSend(args, 'sendAsync');
    }

    /**
     * Clean requests cache and handle request sending
     * @param {Array<JSONRPCRequest, callback>} args web3 provider params
     * @param {String} method provider method for request
     */
    updateCacheAndSend(args, method) {
      this.cleanCacheDebounced();
      const { id: requestId, ...rest } = args[0];
      const payloadStr = JSON.stringify(rest);
      const cacheKey = this.toHashString(payloadStr);

      if (get(this, `cache.${cacheKey}.func`)) {
        this.cache[cacheKey].date = new Date();
        this.cache[cacheKey].buffer.push(args);
      } else {
        this.cache[cacheKey] = {
          date: new Date(),
          func: this.createRequestHandler(cacheKey, method),
          buffer: [args],
        };
      }

      return this.cache[cacheKey].func(...args);
    }

    createRequestHandler(cacheKey, method) {
      const send = (...args) => {
        super[method](args[0], (e, result) => {
          if (!get(this, `cache.${cacheKey}.buffer`)) return;

          const cachedRequestParams = [...this.cache[cacheKey].buffer];
          this.cache[cacheKey].buffer = [];
          this.cache[cacheKey].func = null;
          cachedRequestParams.forEach(([payload, callback]) => {
            const { id } = payload;
            callback(e, { ...result, id });
          });
        });
      };

      return debounce(send, 1000, { maxWait: 1000 });
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

      const now = new Date();

      Object.keys(this.cache).forEach(cacheItem => {
        const { date } = this.cache[cacheItem];
        const expirationTime = new Date(date.getTime() + intervalTime);

        if (now > expirationTime) {
          delete this.cache[cacheItem];
        }
      });
    }
  }

  return DebounceProvider;
};
