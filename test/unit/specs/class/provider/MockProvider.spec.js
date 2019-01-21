import MockProvider from '@/class/provider/MockProvider';
import superclass from 'fixtures/providerSuperclass';

describe('MockProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new (MockProvider(superclass))();
    jest.spyOn(provider, 'send');
    jest.spyOn(provider, 'sendAsync');
  });

  describe('methods', () => {
    const method = 'rpc method';
    const params = ['parameter', {}];
    const value = 'value';

    describe('mockResolvedValue', () => {
      it('should mock resolved value for given method and params', async () => {
        expect.assertions(1);

        provider.mockResolvedValue({ method, params }, value);

        const mockValue =
          provider.mockValues[JSON.stringify({ method, params })];

        await expect(mockValue()).resolves.toBe(value);
      });
    });

    describe('mockResolvedValueOnce', () => {
      it('should mock resolved value for given method and params once', async () => {
        expect.assertions(3);

        const expectedValue1 = 'expected value 1';
        const expectedValue2 = 'expected value 2';

        provider.mockResolvedValueOnce({ method, params }, expectedValue1);
        provider.mockResolvedValueOnce({ method, params }, expectedValue2);

        const mockValuesOnceArray =
          provider.mockValuesOnce[JSON.stringify({ method, params })];

        expect(mockValuesOnceArray.length).toBe(2);
        await expect(mockValuesOnceArray[0]()).resolves.toBe(expectedValue1);
        await expect(mockValuesOnceArray[1]()).resolves.toBe(expectedValue2);
      });
    });

    describe('mockRejectedValue', () => {
      it('should mock rejected value for given method and params', async () => {
        expect.assertions(1);

        provider.mockRejectedValue({ method, params }, value);

        const mockValue =
          provider.mockValues[JSON.stringify({ method, params })];

        await expect(mockValue()).rejects.toBe(value);
      });
    });

    describe('mockRejectedValueOnce', () => {
      it('should mock rejected value for given method and params once', async () => {
        expect.assertions(3);

        const expectedValue1 = 'expected value 1';
        const expectedValue2 = 'expected value 2';

        provider.mockRejectedValueOnce({ method, params }, expectedValue1);
        provider.mockRejectedValueOnce({ method, params }, expectedValue2);

        const mockValuesOnceArray =
          provider.mockValuesOnce[JSON.stringify({ method, params })];

        expect(mockValuesOnceArray.length).toBe(2);
        await expect(mockValuesOnceArray[0]()).rejects.toBe(expectedValue1);
        await expect(mockValuesOnceArray[1]()).rejects.toBe(expectedValue2);
      });
    });

    describe('send', () => {
      it('should call superclass method', () => {
        const payload = {};

        console.warn = jest.fn();

        provider.send(payload);

        expect(provider.send).toHaveBeenCalledTimes(1);
        expect(provider.send).toHaveBeenCalledWith(payload);
      });
    });

    describe('sendAsync', () => {
      const payload = {
        id: 1,
        jsonrpc: '2.0',
        method,
        params,
      };

      it('should handle unmocked requests', () => {
        const callback = jest.fn();

        console.warn = jest.fn();

        provider.sendAsync(payload, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(null, {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: null,
        });
      });

      it('should correctly process a mocked request', async () => {
        expect.assertions(3);

        const expectedValue1 = 'expected value 1';
        const expectedValue2 = 'expected value 2';
        const callback = jest.fn();

        jest.useFakeTimers();

        provider.mockResolvedValue(
          {
            method: payload.method,
            params: payload.params,
          },
          expectedValue2,
        );
        provider.mockResolvedValueOnce(
          {
            method: payload.method,
            params: payload.params,
          },
          expectedValue1,
        );

        provider.sendAsync(payload, callback);
        provider.sendAsync(payload, callback);

        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, null, {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: expectedValue1,
        });
        expect(callback).toHaveBeenNthCalledWith(2, null, {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: expectedValue2,
        });
      });

      it('should correctly reject a mocked request', async () => {
        expect.assertions(3);

        const expectedValue1 = 'expected value 1';
        const expectedValue2 = 'expected value 2';
        const callback = jest.fn();

        jest.useFakeTimers();

        provider.mockRejectedValue(
          {
            method: payload.method,
            params: payload.params,
          },
          expectedValue2,
        );
        provider.mockRejectedValueOnce(
          {
            method: payload.method,
            params: payload.params,
          },
          expectedValue1,
        );

        provider.sendAsync(payload, callback);
        provider.sendAsync(payload, callback);

        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, expectedValue1);
        expect(callback).toHaveBeenNthCalledWith(2, expectedValue2);
      });
    });
  });
});
