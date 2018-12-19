import SubscriptionProvider from '@/class/provider/SubscriptionProvider';

jest.useFakeTimers();

describe('SubscriptionProvider class', () => {
  const callback = jest.fn();
  let provider;

  beforeEach(() => {
    provider = new SubscriptionProvider();

    jest.clearAllMocks();
  });

  describe('on', () => {
    it('should verify callback type', () => {
      expect(() => provider.on()).toThrow(
        'The second parameter callback must be a function.',
      );
      expect(() => provider.on('data', callback)).not.toThrow();
    });

    it('should add callback', () => {
      provider.on('error', callback);
      expect(provider.notificationCallbacks).not.toContainEqual(callback);

      provider.on('data', callback);
      expect(provider.notificationCallbacks).toContainEqual(callback);
    });
  });

  describe('removeListener', () => {
    beforeEach(() => {
      provider.notificationCallbacks = [callback];
    });

    it('should not remove listener', () => {
      provider.removeListener();
      expect(provider.notificationCallbacks).toContainEqual(callback);

      provider.removeListener('error');
      expect(provider.notificationCallbacks).toContainEqual(callback);

      provider.removeListener('data', () => {});
      expect(provider.notificationCallbacks).toContainEqual(callback);
    });

    it('should remove listener', () => {
      provider.removeListener('data', callback);
      expect(provider.notificationCallbacks).not.toContainEqual(callback);
    });
  });

  describe('removeAllListeners', () => {
    const notificationCallbacks = [callback];

    beforeEach(() => {
      provider.notificationCallbacks = [...notificationCallbacks];
    });

    it('should not remove all listeners', () => {
      provider.removeAllListeners();
      expect(provider.notificationCallbacks).toEqual(notificationCallbacks);

      provider.removeAllListeners('error');
      expect(provider.notificationCallbacks).toEqual(notificationCallbacks);
    });

    it('should remove all listeners', () => {
      provider.removeAllListeners('data');
      expect(provider.notificationCallbacks).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset provider', () => {
      jest.spyOn(provider, 'stopPollingNewBlockHeaders');

      provider.notificationCallbacks = [callback];

      provider.reset();

      expect(provider.notificationCallbacks).toEqual([]);
      expect(provider.stopPollingNewBlockHeaders).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendAsync', () => {
    const subsrciptionId = Date.now();
    const subscribeType = 'newHeads';

    it('should handle suscribe method', () => {
      const payload = {
        id: 1,
        method: 'eth_subscribe',
        params: [subscribeType],
      };

      jest.spyOn(Date, 'now').mockImplementation(() => subsrciptionId);

      provider.sendAsync(payload, callback);

      Date.now.mockRestore();

      expect(provider.subsrciptionIds[subsrciptionId]).toEqual({
        type: subscribeType,
      });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null, {
        id: payload.id,
        result: subsrciptionId,
        jsonrpc: '2.0',
      });
    });

    it('should handle unsuscribe method', () => {
      const payload = {
        id: 1,
        method: 'eth_unsubscribe',
        params: [subsrciptionId],
      };

      provider.subsrciptionIds[subsrciptionId] = {};

      provider.sendAsync(payload, callback);

      expect(provider.subsrciptionIds[subsrciptionId]).toBeUndefined();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null, {
        id: payload.id,
        result: true,
        jsonrpc: '2.0',
      });
    });

    it('should call parent sendAsync method', () => {
      const payload = {
        id: 1,
        method: 'eth_call',
        params: [],
      };

      provider.parent = {
        sendAsync: jest.fn(),
      };

      provider.sendAsync(payload, callback);

      expect(provider.parent.sendAsync).toHaveBeenCalledTimes(1);
      expect(provider.parent.sendAsync).toHaveBeenCalledWith(payload, callback);
    });
  });

  describe('setParent', () => {
    it('should set parent', () => {
      const parent = {};

      provider.setParent(parent);

      expect(provider.parent).toEqual(parent);
    });
  });

  describe('startPollingNewBlockHeaders', () => {
    const blockNumber = 1;
    const block = {
      number: blockNumber,
    };
    const getBlockNumber = jest.fn().mockResolvedValue(blockNumber);
    const getBlock = jest.fn().mockResolvedValue(block);
    const subsrciptionId = 'subsrciption id';

    it('should not start polling', () => {
      provider.startPollingNewBlockHeaders();
      expect(setInterval).toHaveBeenCalledTimes(0);

      provider.startPollingNewBlockHeaders(getBlockNumber);
      expect(setInterval).toHaveBeenCalledTimes(0);

      provider.startPollingNewBlockHeaders(null, getBlock);
      expect(setInterval).toHaveBeenCalledTimes(0);
    });

    it('should stop old polling', () => {
      provider.newBlocksIntervalId = 1;

      jest.spyOn(provider, 'stopPollingNewBlockHeaders');

      provider.startPollingNewBlockHeaders(getBlockNumber, getBlock);

      expect(provider.stopPollingNewBlockHeaders).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it('should have correct interval', () => {
      provider.startPollingNewBlockHeaders(getBlockNumber, getBlock);

      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        ENV.blockUpdateInterval,
      );
    });

    it('should start polling and call callbacks', async () => {
      expect.assertions(2);

      provider.notificationCallbacks = [callback];
      provider.subsrciptionIds = {
        [subsrciptionId]: { type: 'newHeads' },
      };

      provider.startPollingNewBlockHeaders(getBlockNumber, getBlock);

      jest.runOnlyPendingTimers();

      await flushPromises();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        method: 'eth_subscribe',
        params: {
          subscription: subsrciptionId,
          result: block,
        },
      });
    });

    it('should start polling and not call callbacks', async () => {
      expect.assertions(1);

      provider.notificationCallbacks = [callback];
      provider.subsrciptionIds = {
        [subsrciptionId]: { type: 'logs' },
      };

      provider.startPollingNewBlockHeaders(getBlockNumber, getBlock);

      jest.runOnlyPendingTimers();

      await flushPromises();

      expect(callback).toHaveBeenCalledTimes(0);
    });

    it('should not call callback if getBlock return null', async () => {
      expect.assertions(1);

      provider.notificationCallbacks = [callback];
      provider.subsrciptionIds = {
        [subsrciptionId]: { type: 'newHeads' },
      };

      getBlock.mockResolvedValueOnce(null);

      provider.startPollingNewBlockHeaders(getBlockNumber, getBlock);

      jest.runOnlyPendingTimers();

      await flushPromises();

      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe('stopPollingNewBlockHeaders', () => {
    it('should stop polling', () => {
      const newBlocksIntervalId = 1;

      provider.newBlocksIntervalId = newBlocksIntervalId;

      provider.stopPollingNewBlockHeaders();

      expect(clearInterval).toHaveBeenCalledTimes(1);
      expect(clearInterval).toHaveBeenCalledWith(newBlocksIntervalId);
      expect(provider.newBlocksIntervalId).toBeNull();
    });
  });
});
