import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { NotificationError } from '@/class';
import { httpIdentity, proxyRequest } from '@/class/singleton';
import { IDENTITY_MODE } from '@/constants';
import { addresses } from 'fixtures/accounts';

const identityModeService = require.requireActual('@/services/identityMode')
  .default;

describe('Identity mode service', () => {
  const identityModeKey = 'identityMode';
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(httpIdentity);
  });

  describe('setIdentityMode', () => {
    const url = ENV.VUE_APP_IDENTITY_API_URL;
    const type = IDENTITY_MODE.CUSTOM;
    const mode = { type, serverUrl: url };

    afterEach(() => {
      localStorage.setItem.mockReset();
    });

    it('should set the identity mode', () => {
      expect.assertions(2);

      const spyProxyRequest = jest.spyOn(proxyRequest, 'setMode');

      identityModeService.setIdentityMode(type, url);

      expect(spyProxyRequest).toHaveBeenCalledTimes(1);
      expect(spyProxyRequest).toBeCalledWith(type, url);

      spyProxyRequest.mockRestore();
    });

    it('should save the identity mode in the local storage', () => {
      expect.assertions(2);

      identityModeService.setIdentityMode(type, url);

      const expected = JSON.stringify(mode);

      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(localStorage.setItem).toBeCalledWith(identityModeKey, expected);
    });
  });

  describe('getIdentityMode', () => {
    afterEach(() => {
      localStorage.getItem.mockReset();
    });

    it('should get the identity mode', () => {
      identityModeService.getIdentityMode();

      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toBeCalledWith(identityModeKey);
    });

    it('should return default identity mode', () => {
      const mode = identityModeService.getIdentityMode();

      expect(mode).toEqual({ type: IDENTITY_MODE.DEFAULT });
    });
  });

  describe('deleteIdentityData', () => {
    beforeEach(() => {
      proxyRequest.clear = jest.fn();
    });

    it('should delete identity mode data', async () => {
      expect.assertions(1);

      await identityModeService.deleteIdentityData();

      expect(proxyRequest.clear).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      expect.assertions(1);

      proxyRequest.clear.mockRejectedValueOnce(new Error());

      try {
        await identityModeService.deleteIdentityData();
      } catch (e) {
        expect(e).toBeInstanceOf(NotificationError);
      }
    });
  });

  describe('validateIdentityServer', () => {
    const serverUrl = 'http://server.com';
    const url = `${serverUrl}/accounts`;
    const successResp = [...addresses];
    const invalidResp = 'invalid response';

    beforeEach(() => {
      axiosMock = new MockAdapter(axios);
    });

    it('should make correct request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply((config) => {
        expect(config.url).toBe(url);
        return [200, successResp];
      });

      await identityModeService.validateIdentityServer(serverUrl);
    });

    it('should return true if the valid custom server', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, successResp);

      const isValid = await identityModeService.validateIdentityServer(
        serverUrl,
      );

      expect(isValid).toBe(true);
    });

    it('should throw an error when the response format is invalid', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(200, invalidResp);

      try {
        await identityModeService.validateIdentityServer(serverUrl);
      } catch (e) {
        expect(e).toBeInstanceOf(NotificationError);
        expect(e.title).toBe('No Accounts');
      }
    });

    it('should throw an error when the response status is 401', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(401);

      try {
        await identityModeService.validateIdentityServer(serverUrl);
      } catch (e) {
        expect(e).toBeInstanceOf(NotificationError);
        expect(e.title).toBe('Not Logged In');
      }
    });

    it('should throw an error when the response status is invalid', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(404);

      try {
        await identityModeService.validateIdentityServer(serverUrl);
      } catch (e) {
        expect(e).toBeInstanceOf(NotificationError);
        expect(e.title).toBe('Invalid Identity Server');
      }
    });
  });
});
