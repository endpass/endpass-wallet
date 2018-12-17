const toPayload = (id, result) => ({
  id,
  result,
  jsonrpc: '2.0',
});

export default class SubscriptionProvider {
  notificationCallbacks = [];
  subsrciptionIds = {};
  newBlocksIntervalId = null;

  on(type, callback) {
    if (typeof callback !== 'function') {
      throw new Error('The second parameter callback must be a function.');
    }

    if (type === 'data') {
      this.notificationCallbacks.push(callback);
    }
  }

  removeListener(type, callback) {
    if (type === 'data') {
      this.notificationCallbacks.forEach((cb, index) => {
        if (cb === callback) this.notificationCallbacks.splice(index, 1);
      });
    }
  }

  removeAllListeners(type) {
    if (type === 'data') {
      this.notificationCallbacks = [];
    }
  }

  reset() {
    this.notificationCallbacks = [];

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

    return this.parent.sendAsync(payload, callback);
  }

  setParent(parent) {
    this.parent = parent;
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

          lastBlockNumber = blockNumber;

          this.notificationCallbacks.forEach(callback => {
            if (typeof callback !== 'function') {
              return;
            }

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
      }
    }, ENV.blockUpdateInterval);
  }

  stopPollingNewBlockHeaders() {
    clearInterval(this.newBlocksIntervalId);
    this.newBlocksIntervalId = null;
  }
}
