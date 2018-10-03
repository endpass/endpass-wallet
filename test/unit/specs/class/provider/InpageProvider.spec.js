import InpageProvider from '@/class/provider/InpageProvider/InpageProvider';
import {
  INPAGE_PROVIDER_SETTINGS_EVENT,
  INPAGE_PROVIDER_REQUEST_EVENT,
  INPAGE_PROVIDER_RESPONSE_EVENT,
  INPAGE_PROVIDER_ERROR_EVENT,
} from '@/class/provider/InpageProvider/InpageProvider.types';
import { EventEmitter } from '@/class';

describe('InpageProvider Class', () => {
  let provider, eventEmitter;
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
      eventEmitter.emit(INPAGE_PROVIDER_SETTINGS_EVENT, payload);
      expect(provider.updateSettings).toHaveBeenCalledWith(payload);
    });
    it('should bind handleResponse to response event', () => {
      const payload = {},
        error = {};
      provider.handleResponse = jest.fn();
      eventEmitter.emit(INPAGE_PROVIDER_RESPONSE_EVENT, payload, error);
      expect(provider.handleResponse).toHaveBeenCalledWith(payload, error);
    });
    it('should bind emitError to error event', () => {
      const payload = {},
        error = {};
      provider.emitError = jest.fn();
      eventEmitter.emit(INPAGE_PROVIDER_ERROR_EVENT, payload, error);
      expect(provider.emitError).toHaveBeenCalledWith(payload, error);
    });
  });
  describe('methods', () => {
    describe('handleResponse', () => {
      it('should call callback by payload id', () => {
        const payload = { id: 'kek' };
        provider.pendingRequestsHandlers[payload.id] = jest.fn();
        provider.handleResponse({}, payload);
        expect(
          provider.pendingRequestsHandlers[payload.id],
        ).toHaveBeenCalledWith({}, payload);
      });
    });

    describe('updateSettings', () => {
      it('should set selectedAddress and networkVersion', () => {
        const settings = {
          selectedAddress: 'eke',
          networkVersion: 'kek',
        };
        provider.updateSettings(settings);
        expect(provider.settings.selectedAddress).toBe(
          settings.selectedAddress,
        );
        expect(provider.settings.networkVersion).toBe(settings.networkVersion);
      });

      it('should set selectedAddress and networkVersion as undefined', () => {
        const settings = {
          selectedAddress: 'eke',
          networkVersion: 'kek',
        };
        provider.updateSettings(settings);
        provider.updateSettings({});
        expect(provider.settings.selectedAddress).toBe(
          settings.selectedAddress,
        );
        expect(provider.settings.networkVersion).toBe(settings.networkVersion);
      });
    });

    describe('emitError', () => {
      it('should throw error', () => {
        const error = new Error('kek');
        function emitError() {
          provider.emitError(error);
        }
        expect(emitError).toThrowError(Error);
      });
    });

    describe('sendAsync', () => {
      it('should save callback', () => {
        const payload = { id: 'kek' },
          callback = jest.fn();
        provider.sendAsync(payload, callback);
        expect(provider.pendingRequestsHandlers[payload.id]).toBe(callback);
      });

      it('should emit request event width payload', () => {
        const payload = { id: 'kek' },
          callback = jest.fn();
        provider.eventEmitter.emit = jest.fn();
        provider.sendAsync(payload, callback);
        expect(provider.eventEmitter.emit).toHaveBeenCalledWith(
          INPAGE_PROVIDER_REQUEST_EVENT,
          payload,
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
        const payload = { id: 'kek' },
          callback = jest.fn();
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
          networkVersion: 'kek',
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
