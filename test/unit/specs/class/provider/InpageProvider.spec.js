import { EventEmitter } from '@/class';
import { INPAGE_EVENT, INPAGE_ID_PREFIX } from '@/constants';

const InpageProvider = require.requireActual('@/class/provider/InpageProvider')
  .default;

describe('InpageProvider', () => {
  let provider;
  let eventEmitter;

  beforeEach(() => {
    jest.resetAllMocks();
    eventEmitter = new EventEmitter();
    provider = new InpageProvider(eventEmitter);
  });

  describe('constructor', () => {
    it('should throws is passed eventEmitter is not instance of EventEmmiter', () => {
      expect(() => {
        /* eslint-disable-next-line */
        new InpageProvider({});
      }).toThrow();
    });

    it('should set settings and responses handlers', () => {
      eventEmitter = new EventEmitter();
      jest.spyOn(eventEmitter, 'on');
      provider = new InpageProvider(eventEmitter);

      eventEmitter.emit(INPAGE_EVENT.SETTINGS, 'foo');
      eventEmitter.emit(INPAGE_EVENT.RESPONSE, { id: 'bar' });

      expect(eventEmitter.on).toHaveBeenNthCalledWith(
        1,
        INPAGE_EVENT.SETTINGS,
        expect.any(Function),
      );
      expect(eventEmitter.on).toHaveBeenNthCalledWith(
        2,
        INPAGE_EVENT.RESPONSE,
        expect.any(Function),
      );
    });
  });

  describe('static methods', () => {
    describe('createInpageIdFromRequestId', () => {
      it('should create inpage id with prefix', () => {
        expect(InpageProvider.createInpageIdFromRequestId('1')).toBe(
          `${INPAGE_ID_PREFIX}1`,
        );
      });
    });

    describe('restoreRequestIdFromInpageId', () => {
      it('should return id without inpage prefix', () => {
        expect(
          InpageProvider.restoreRequestIdFromInpageId(`${INPAGE_ID_PREFIX}1`),
        ).toBe(1);
      });
    });
  });

  describe('methods', () => {
    describe('handleResponse', () => {
      it('should call callback by payload id', () => {
        const result = {};
        const error = {};
        const jsonrpc = '1';
        const id = '2';
        const payload = { id, result, error, jsonrpc };
        const callback = jest.fn();

        provider.pendingRequestsHandlers[id] = callback;
        provider.handleResponse(payload);

        expect(callback).toHaveBeenCalledWith(error, {
          result,
          id: parseInt(id, 10),
          jsonrpc,
        });
      });

      it('should delete pointers by id', () => {
        const result = {};
        const error = {};
        const payload = { id: '1', result, error };

        provider.pendingRequestsHandlers[payload.id] = jest.fn();
        provider.handleResponse(payload);

        expect(provider.pendingRequestsHandlers).not.toHaveProperty(payload.id);
      });
    });

    describe('handleSettings', () => {
      it('should set selectedAddress and networkVersion', () => {
        const settings = {
          selectedAddress: '2',
          networkVersion: '1',
        };

        provider.handleSettings(settings);

        expect(provider.settings.selectedAddress).toBe(
          settings.selectedAddress,
        );
        expect(provider.settings.networkVersion).toBe(settings.networkVersion);
      });

      it('should set selectedAddress and networkVersion as undefined', () => {
        const settings = {
          selectedAddress: '2',
          networkVersion: '1',
        };

        provider.handleSettings(settings);
        provider.handleSettings({});

        expect(provider.settings.selectedAddress).toBe(
          settings.selectedAddress,
        );
        expect(provider.settings.networkVersion).toBe(settings.networkVersion);
      });
    });

    describe('sendAsync', () => {
      it('should save callback', () => {
        const payload = { id: '1' };
        const callback = jest.fn();

        provider.sendAsync(payload, callback);

        expect(provider.pendingRequestsHandlers[payload.id]).toBe(callback);
      });

      it('should emit request event with payload', () => {
        const payload = { id: '1' };
        const callback = jest.fn();
        const expectedPayload = { id: `${INPAGE_ID_PREFIX}${payload.id}` };

        provider.eventEmitter.emit = jest.fn();
        provider.sendAsync(payload, callback);

        expect(provider.eventEmitter.emit).toHaveBeenCalledWith(
          INPAGE_EVENT.REQUEST,
          expectedPayload,
        );
      });
    });

    describe('isConnected', () => {
      it('should return true', () => {
        expect(provider.isConnected()).toBe(true);
      });
    });

    describe('enable', () => {
      it('should call correct method', async () => {
        expect.assertions(1);
        provider.processPayload = jest.fn().mockResolvedValue({});
        await provider.enable();
        expect(provider.processPayload).toHaveBeenCalledWith({
          method: 'eth_accounts',
        });
      });

      it('should return accounts', () => {
        const result = ['0x0'];
        provider.processPayload = jest.fn().mockResolvedValue({ result });
        expect(provider.enable()).resolves.toBe(result);
      });
    });

    describe('send', () => {
      it('should return result by method', () => {
        const payload = { id: '1' };
        const callback = jest.fn();

        provider.sendAsync(payload, callback);

        expect(provider.pendingRequestsHandlers[payload.id]).toBe(callback);
      });

      it('should return correct payload', () => {
        expect(provider.send({ method: 'eth_accounts' }).result).toEqual([]);
        expect(provider.send({ method: 'eth_coinbase' }).result).toBe(null);
        expect(provider.send({ method: 'net_version' }).result).toBe(null);

        provider.settings = {
          selectedAddress: 'eke',
          networkVersion: '1',
        };

        expect(provider.send({ method: 'eth_accounts' }).result).toEqual([
          provider.settings.selectedAddress,
        ]);
        expect(provider.send({ method: 'eth_coinbase' }).result).toBe(
          provider.settings.selectedAddress,
        );
        expect(provider.send({ method: 'net_version' }).result).toBe(
          provider.settings.networkVersion,
        );
      });
    });
  });
});
