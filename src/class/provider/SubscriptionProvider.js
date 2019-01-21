const EVENT_TYPES = {
  DATA: 'data',
  ERROR: 'error',
};

const toPayload = (id, result) => ({
  id,
  result,
  jsonrpc: '2.0',
});

export default superclass =>
  class SubscriptionProvider extends superclass {
    notificationCallbacks = {
      [EVENT_TYPES.DATA]: [],
      [EVENT_TYPES.ERROR]: () => {},
    };
    subsrciptionIds = {};
    newBlocksIntervalId = null;

    constructor(...args) {
      super(...args);
    }

    on(type, callback) {
      if (typeof callback !== 'function') {
        throw new Error('The second parameter callback must be a function.');
      }

      if (type === EVENT_TYPES.DATA) {
        this.notificationCallbacks[type].push(callback);
      } else {
        this.notificationCallbacks[type] = callback;
      }
    }

    removeListener(type, callback) {
      if (type === EVENT_TYPES.DATA) {
        this.notificationCallbacks[EVENT_TYPES.DATA].forEach(
          (cb, index, callbacks) => {
            if (cb === callback) {
              callbacks.splice(index, 1);
            }
          },
        );
      }
    }

    removeAllListeners(type) {
      if (!type) {
        return;
      }

      this.notificationCallbacks[type] =
        type === EVENT_TYPES.DATA ? [] : () => {};
    }

    reset() {
      this.notificationCallbacks = {};

      this.stopPollingNewBlockHeaders();
    }

    sendAsync(payload, callback) {
      const { method, params } = payload;

      if (method.indexOf('_subscribe') !== -1) {
        const subscriptionId = Date.now();

        this.subsrciptionIds[subscriptionId] = { type: params[0] };

        return callback(null, toPayload(payload.id, subscriptionId));
      }

      if (method.indexOf('_unsubscribe') !== -1) {
        delete this.subsrciptionIds[params[0]];

        return callback(null, toPayload(payload.id, true));
      }

      return super.sendAsync(payload, callback);
    }

    startPollingNewBlockHeaders(getBlockNumber, getBlock) {
      let lastBlockNumber = null;

      if (!getBlockNumber || !getBlock) {
        return;
      }

      if (this.newBlocksIntervalId) {
        this.stopPollingNewBlockHeaders();
      }

      this.newBlocksIntervalId = setInterval(async () => {
        try {
          const blockNumber = await getBlockNumber();

          if (lastBlockNumber !== blockNumber) {
            const block = await getBlock(blockNumber);

            if (!block) {
              // Probably if node is not synced
              return;
            }

            lastBlockNumber = blockNumber;

            this.notificationCallbacks[EVENT_TYPES.DATA].forEach(callback => {
              Object.entries(this.subsrciptionIds).forEach(
                ([subsrciptionId, { type }]) => {
                  if (type === 'newHeads') {
                    callback({
                      method: 'eth_subscribe',
                      params: {
                        subscription: subsrciptionId,
                        result: block,
                      },
                    });
                  }
                },
              );
            });
          }
        } catch (error) {
          console.error(error);
          this.notificationCallbacks[EVENT_TYPES.ERROR](error);
        }
      }, ENV.blockUpdateInterval);
    }

    stopPollingNewBlockHeaders() {
      clearInterval(this.newBlocksIntervalId);
      this.newBlocksIntervalId = null;
    }
  };
