import web3 from 'web3';
import ProviderFactory from '@/class/provider/ProviderFactory';
import MockMixin from '@/class/provider/mixins/MockMixin';

const { HttpProvider, WebsocketProvider, IpcProvider } = web3.providers;

describe('ProviderFactory', () => {
  const httpUrl = 'https://url.com';
  const wsUrl = 'wss://url.com';

  describe('getProviderClass', () => {
    it('should return correct provider class', () => {
      const ipcUrl = '/path/geth.ipc';
      const ipcConnection = { connect: jest.fn(() => ({ on: jest.fn() })) };

      const HttpP = ProviderFactory.getProviderClass(httpUrl);
      const WsP = ProviderFactory.getProviderClass(wsUrl);
      const IpcP = ProviderFactory.getProviderClass(ipcUrl);

      expect(new HttpP(httpUrl)).toBeInstanceOf(HttpProvider);
      expect(new WsP(wsUrl)).toBeInstanceOf(WebsocketProvider);
      expect(new IpcP(ipcUrl, ipcConnection)).toBeInstanceOf(IpcProvider);
    });

    it('should throw error with wrong url', () => {
      const wrongUrl = '//url.com';

      expect(() => ProviderFactory.getProviderClass(wrongUrl)).toThrow();
    });
  });

  describe('getInstance', () => {
    it('should return provider instance', () => {
      expect(ProviderFactory.getInstance(httpUrl)).toBeInstanceOf(HttpProvider);
    });

    it('should return mocked provider instance when Cypress', () => {
      global.Cypress = true;

      const provider = ProviderFactory.getInstance(httpUrl);

      // instanceof not work
      expect(provider.constructor.name).toBe(MockMixin(HttpProvider).name);

      global.Cypress = undefined;
    });
  });

  describe('create', () => {
    it('should return provider instance', () => {
      expect(ProviderFactory.create(httpUrl)).toBeInstanceOf(HttpProvider);
    });

    it('should return provider instance with fallback', () => {
      const urls = [].concat(httpUrl, wsUrl, 'http://temp.com');
      const provider = ProviderFactory.create(urls);
      const fallback = provider.getFallbackProviders();

      expect(provider).toBeInstanceOf(HttpProvider);
      expect(fallback).toHaveLength(2);
      expect(fallback[0]).toBeInstanceOf(WebsocketProvider);
      expect(fallback[1]).toBeInstanceOf(HttpProvider);
    });

    it('should return provider instance with error handler setter', () => {
      const provider = ProviderFactory.create(httpUrl);

      expect(provider.setErrorHandler).toBeInstanceOf(Function);
    });
  });
});
