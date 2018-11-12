import InpageProvider from '@/class/provider/InpageProvider';
import { EventEmitter } from '@/class';
import { INPAGE_EVENT, INPAGE_ID_PREFIX } from '@/constants';

describe('InpageProvider', () => {
  let provider;
  let eventEmitter;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    provider = new InpageProvider(eventEmitter);
  });

  describe('constructor', () => {
    it('should save eventEmitter', () => {
      expect(provider.eventEmitter === eventEmitter).toBeTruthy();
    });

    it('pendingRequestsHandlers should be empty object', () => {
      expect(provider.pendingRequestsHandlers).toEqual({});
    });

    it('should bind updateSettings to settings event', () => {
      const payload = {};
      provider.updateSettings = jest.fn();
      eventEmitter.emit(INPAGE_EVENT.SETTINGS, payload);
      expect(provider.updateSettings).toHaveBeenCalledWith(payload);
    });

    it('should bind handleResponse to response event', () => {
      const payload = {};
      provider.handleResponse = jest.fn();
      eventEmitter.emit(INPAGE_EVENT.RESPONSE, payload);
      expect(provider.handleResponse).toHaveBeenCalledWith(payload);
    });
  });

  describe('methods', () => {
    describe('handleResponse', () => {
      it('should call callback by payload id', () => {
        const result = {};

        const error = {};

        const jsonrpc = '1';

        const id = '2';

        const callback = jest.fn();

        const payload = { id, result, error, jsonrpc };
        provider.pendingRequestsHandlers[id] = callback;
        provider.handleResponse(payload);
        expect(callback).toHaveBeenCalledWith(error, {
          result,
          id: parseInt(id),
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

    describe('updateSettings', () => {
      it('should set selectedAddress and networkVersion', () => {
        const settings = {
          selectedAddress: '2',
          networkVersion: '1',
        };
        provider.updateSettings(settings);
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
        provider.updateSettings(settings);
        provider.updateSettings({});
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

    describe('send', () => {
      it('should return result by method', () => {
        const payload = { id: '1' };

        const callback = jest.fn();
        provider.sendAsync(payload, callback);
        expect(provider.pendingRequestsHandlers[payload.id]).toBe(callback);
      });

      it('should return correct payload', () => {
        let method = 'eth_accounts';
        expect(provider.send({ method }).result).toEqual([]);
        method = 'eth_coinbase';
        expect(provider.send({ method }).result).toBe(null);
        method = 'net_version';
        expect(provider.send({ method }).result).toBe(null);
        provider.settings = {
          selectedAddress: 'eke',
          networkVersion: '1',
        };
        method = 'eth_accounts';
        expect(provider.send({ method }).result).toEqual([
          provider.settings.selectedAddress,
        ]);
        method = 'eth_coinbase';
        expect(provider.send({ method }).result).toBe(
          provider.settings.selectedAddress,
        );
        method = 'net_version';
        expect(provider.send({ method }).result).toBe(
          provider.settings.networkVersion,
        );
      });
    });
  });
});
