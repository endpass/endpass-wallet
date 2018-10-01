import axios from 'axios';
import { http, proxyRequest } from '@/utils';
import MockAdapter from 'axios-mock-adapter';

import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';
import { IDENTITY_MODE } from '@/constants';
import { addresses } from 'fixtures/accounts';

const userService = require.requireActual('@/services/user').default;

describe('User service', () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(http);
  });

  describe('login', () => {
    const redirectUri = '/send?to=0x1234&amount=0.1';
    const url = `${identityAPIUrl}/auth?redirect_uri=%2Fsend%3Fto%3D0x1234%26amount%3D0.1`;
    const email = '123@email.com';

    const successResp = {
      success: true,
      challenge: {
        challenge_type: 'email_auth',
      },
    };

    const expectedError = new NotificationError({
      title: 'Auth error',
      text: 'Invalid or missing email address. Please, try again',
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onPost(url).reply(config => {
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify({ email }));

        return [200, successResp];
      });

      await userService.login({ email, redirectUri });
    });

    it('should handle successfull POST /auth request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(200, successResp);

      const challengeType = await userService.login({ email, redirectUri });

      expect(challengeType).toBe(successResp.challenge.challenge_type);
    });

    it('should handle failed POST /auth request', async () => {
      axiosMock.onPost(url).reply(200, { success: false });
      try {
        await userService.login(email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected POST /auth request', async () => {
      axiosMock.onPost(url).reply(500, {});
      try {
        await userService.login(email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('loginViaOTP', () => {
    const code = 'code';
    const email = '123@email.com';
    const url = `${identityAPIUrl}/token`;
    const successResp = {
      success: true,
    };
    const expectedError = new NotificationError({
      title: 'Auth error',
      text: 'Invalid or missing one time password. Please, try again',
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(
          JSON.stringify({
            challenge_type: 'otp',
            code,
            email,
          }),
        );
        return [200, successResp];
      });
      await userService.loginViaOTP(code, email);
    });

    it('should handle successfull POST /token request', async () => {
      axiosMock.onPost(url).reply(200, successResp);
      const resp = await userService.loginViaOTP(code, email);
      expect(resp).toEqual(successResp);
    });

    it('should handle failed POST /token request', async () => {
      axiosMock.onPost(url).reply(200, { success: false });
      try {
        await userService.loginViaOTP(code, email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected POST /token request', async () => {
      axiosMock.onPost(url).reply(500, { success: false });
      try {
        await userService.loginViaOTP(code, email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('logout', () => {
    const url = `${identityAPIUrl}/logout`;
    const expectedError = new NotificationError({
      title: 'Log out error',
      text: 'Failed to log out. Please, try again',
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(config => {
        expect(config.url).toBe(url);
        return [200, {}];
      });

      await userService.logout();
    });

    it('should handle rejected POST /logout request', async () => {
      axiosMock.onPost(url).reply(500, {});
      try {
        await userService.logout();
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('getSettings', () => {
    const url = `${identityAPIUrl}/user`;
    const successResp = {
      settings: {
        fiatCurrency: 'USD',
      },
    };

    it('should make correct request', async () => {
      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getSettings();
    });

    it('should handle successfull GET /user request', async () => {
      axiosMock.onGet(url).reply(200, successResp);
      const settings = await userService.getSettings();
      expect(settings).toEqual(successResp);
    });
  });

  describe('setSettings', () => {
    const settings = {
      settings: {
        fiatCurrency: 'USD',
      },
    };
    const url = `${identityAPIUrl}/user`;
    const successResp = {
      success: true,
    };

    it('should make correct request', async () => {
      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify(settings));
        return [200, successResp];
      });
      await userService.setSettings(settings);
    });

    it('should handle successful POST /user request', async () => {
      axiosMock.onPost(url).reply(200, successResp);
      const resp = await userService.setSettings(settings);
      expect(resp).toEqual(successResp);
    });
  });

  describe('getAccounts', () => {
    const url = `${identityAPIUrl}/accounts`;
    const successResp = ['0x123', 'xpub1234'];

    it('should make correct request', async () => {
      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getAccounts();
    });

    it('should handle successful GET /accounts request', async () => {
      axiosMock.onGet(url).reply(200, successResp);
      const accounts = await userService.getAccounts();
      expect(accounts.length).toBe(2);
      expect(accounts[0]).toEqual(successResp[0]);
    });
  });

  describe('getAccount', () => {
    const address = '0x456';
    const url = `${identityAPIUrl}/account/${address}`;
    const shortAcc = address.replace(/^(.{5}).+/, '$1…');
    const successResp = {};
    const expectedError = new NotificationError({
      title: 'Account request error',
      text: `Failed to get account ${shortAcc}. Please, reload page`,
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getAccount(address);
    });

    it('should handle successfull GET /account request', async () => {
      axiosMock.onGet(url).reply(200, successResp);
      const account = await userService.getAccount(address);
      // Address should be automatically appended by getAccount
      expect(account).toEqual({ address });
    });

    it('should handle rejected GET /account request', async () => {
      axiosMock.onGet(url).reply(404);
      try {
        await userService.getAccount(address);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('setAccount', () => {
    const address = '0x123';
    // Account data can be anything
    const account = { version: 3, crypto: {} };
    const url = `${identityAPIUrl}/account/${address}`;
    const successResp = {
      success: true,
    };

    it('should make correct request', async () => {
      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify(account));
        return [200, successResp];
      });
      await userService.setAccount(address, account);
    });

    it('should handle successful POST /account request', async () => {
      axiosMock.onPost(url).reply(200, successResp);
      const resp = await userService.setAccount(address, account);
      expect(resp).toEqual(successResp);
    });
  });

  describe('updateAccounts', () => {
    const url = `${identityAPIUrl}/accounts`;
    const accounts = {
      'address 1': {},
      'address 2': {},
    };
    const successResp = {
      success: true,
    };
    const expectedError = new NotificationError({
      title: 'Error updating accounts',
      text: `An error occurred updating accounts. Please try again later`,
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      expect.assertions(3);

      axiosMock.onAny(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify(accounts));

        return [200];
      });
      await userService.updateAccounts(accounts);
    });

    it('should handle successful POST /accounts request', async () => {
      axiosMock.onPost(url).reply(200, successResp);

      expect.assertions(1);

      const response = await userService.updateAccounts(accounts);

      expect(response).toEqual(successResp);
    });

    it('should handle rejected GET /accounts request', async () => {
      axiosMock.onPost(url).reply(404);

      expect.assertions(1);

      try {
        await userService.updateAccounts(accounts);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('HD Accounts', () => {
    const addrs = ['0x123', 'xpubabcde', '0x456'];

    it('should return keystores for regular accounts only', async () => {
      axiosMock.onGet(`${identityAPIUrl}/accounts`).reply(200, addrs);
      axiosMock
        .onGet(new RegExp(`${identityAPIUrl}/account/.+`))
        .reply(200, {});

      const accounts = await userService.getV3Accounts();
      expect(accounts.length).toBe(2);
      expect(accounts[0]).toEqual({ address: '0x123' });
      expect(accounts[1]).toEqual({ address: '0x456' });
    });

    it('should return the HD key if it exists', async () => {
      axiosMock.onGet(`${identityAPIUrl}/accounts`).reply(200, addrs);
      axiosMock
        .onGet(new RegExp(`${identityAPIUrl}/account/.+`))
        .reply(200, {});

      const account = await userService.getHDKey();
      expect(account).toBeTruthy();
      expect(account.address).toBe('xpubabcde');
    });
  });

  describe('getOtpSettings', () => {
    const url = `${identityAPIUrl}/otp`;
    const successResp = {
      secret: 'abc',
    };
    const expectedError = new NotificationError({
      title: 'Error requesting two-factor authentication settings',
      text: `Failed to get OTP settings.`,
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getOtpSettings();
    });

    it('should handle successful GET /otp request', async () => {
      axiosMock.onGet(url).reply(200, successResp);
      const otp = await userService.getOtpSettings();
      expect(otp).toEqual(successResp);
    });

    it('should handle rejected GET /otp request', async () => {
      axiosMock.onGet(url).reply(500, {});
      try {
        await userService.getOtpSettings();
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('setOtpSettings', () => {
    const url = `${identityAPIUrl}/otp`;
    const secret = 'secret';
    const code = 'code';
    const successResp = {
      success: true,
    };
    const expectedError = new NotificationError({
      title: 'Error saving two-factor authentication settings',
      text: `Failed to save OTP settings.`,
      type: 'is-danger',
    });
    const errorMessage = 'server error';

    it('should make correct request', async () => {
      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify({ secret, code }));
        return [200, successResp];
      });
      await userService.setOtpSettings(secret, code);
    });

    it('should handle successful POST /otp request', async () => {
      axiosMock.onPost(url).reply(200, successResp);
      const resp = await userService.setOtpSettings(secret, code);
      expect(resp).toEqual(successResp);
    });

    it('should handle failed POST /otp request', async () => {
      const error = new NotificationError({
        ...expectedError,
        message: `POST ${url}: ${errorMessage}`,
      });

      axiosMock
        .onPost(url)
        .reply(200, { success: false, message: errorMessage });

      try {
        await userService.setOtpSettings(secret, code);
      } catch (receivedError) {
        expect(receivedError).toEqual(error);
      }
    });

    it('should handle rejected POST /otp request', async () => {
      axiosMock.onPost(url).reply(500, {});
      try {
        await userService.setOtpSettings();
      } catch (receivedError) {
        expect(receivedError.text).toEqual(expectedError.text);
      }
    });
  });

  describe('deleteOtpSettings', () => {
    const url = `${identityAPIUrl}/otp`;
    const code = 'code';
    const successResp = {
      success: true,
    };
    const expectedError = new NotificationError({
      title: 'Error removing two-factor authentication settings',
      text: `Failed to remove OTP settings.`,
      type: 'is-danger',
    });
    const errorMessage = 'server error';

    it('should make correct request', async () => {
      axiosMock.onDelete(url).reply(config => {
        expect(config.method).toBe('delete');
        expect(config.url).toBe(`${identityAPIUrl}/otp`);
        expect(config.data).toBe(JSON.stringify({ code }));
        return [200, successResp];
      });
      await userService.deleteOtpSettings(code);
    });

    it('should handle successful DELETE /otp request', async () => {
      axiosMock.onDelete(url).reply(200, successResp);
      const resp = await userService.deleteOtpSettings(code);
      expect(resp).toEqual(successResp);
    });

    it('should handle failed DELETE /otp request', async () => {
      const error = new NotificationError({
        ...expectedError,
        message: `DELETE ${url}: ${errorMessage}`,
      });

      axiosMock
        .onDelete(url)
        .reply(200, { success: false, message: errorMessage });

      try {
        await userService.deleteOtpSettings(code);
      } catch (receivedError) {
        expect(receivedError).toEqual(error);
      }
    });

    it('should handle rejected DELETE /otp request', async () => {
      axiosMock.onDelete(url).reply(500, {});
      try {
        await userService.deleteOtpSettings(code);
      } catch (receivedError) {
        expect(receivedError.text).toEqual(expectedError.text);
      }
    });
  });

  describe('Identity mode', () => {
    const identityModeKey = 'identityMode';

    describe('setIdentityMode', () => {
      const url = identityAPIUrl;
      const type = IDENTITY_MODE.CUSTOM;
      const mode = { type, serverUrl: url };

      afterEach(() => {
        localStorage.setItem.mockReset();
      });

      it('should set the identity mode', () => {
        expect.assertions(2);

        const spyProxyRequest = jest.spyOn(proxyRequest, 'setMode');

        userService.setIdentityMode(type, url);

        expect(spyProxyRequest).toHaveBeenCalledTimes(1);
        expect(spyProxyRequest).toBeCalledWith(type, url);

        spyProxyRequest.mockRestore();
      });

      it('should save the identity mode in the local storage', () => {
        expect.assertions(2);

        userService.setIdentityMode(type, url);

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
        userService.getIdentityMode();

        expect(localStorage.getItem).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem).toBeCalledWith(identityModeKey);
      });

      it('should return default identity mode', () => {
        const mode = userService.getIdentityMode();

        expect(mode).toEqual({ type: IDENTITY_MODE.DEFAULT });
      });
    });

    describe('deleteIdentityData', () => {
      beforeEach(() => {
        proxyRequest.clear = jest.fn();
      });

      it('should delete identity mode data', async () => {
        expect.assertions(1);

        await userService.deleteIdentityData();

        expect(proxyRequest.clear).toHaveBeenCalledTimes(1);
      });

      it('should handle errors', async () => {
        expect.assertions(1);

        proxyRequest.clear.mockRejectedValueOnce(new Error());

        try {
          await userService.deleteIdentityData();
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

        axiosMock.onGet(url).reply(config => {
          expect(config.url).toBe(url);
          return [200, successResp];
        });

        await userService.validateIdentityServer(serverUrl);
      });

      it('should return true if the valid custom server', async () => {
        expect.assertions(1);

        axiosMock.onGet(url).reply(200, successResp);

        const isValid = await userService.validateIdentityServer(serverUrl);

        expect(isValid).toBe(true);
      });

      it('should throw an error when the response format is invalid', async () => {
        expect.assertions(2);

        axiosMock.onGet(url).reply(200, invalidResp);

        try {
          await userService.validateIdentityServer(serverUrl);
        } catch (e) {
          expect(e).toBeInstanceOf(NotificationError);
          expect(e.title).toBe('No Accounts');
        }
      });

      it('should throw an error when the response status is 401', async () => {
        expect.assertions(2);

        axiosMock.onGet(url).reply(401);

        try {
          await userService.validateIdentityServer(serverUrl);
        } catch (e) {
          expect(e).toBeInstanceOf(NotificationError);
          expect(e.title).toBe('Not Logged In');
        }
      });

      it('should throw an error when the response status is invalid', async () => {
        expect.assertions(2);

        axiosMock.onGet(url).reply(404);

        try {
          await userService.validateIdentityServer(serverUrl);
        } catch (e) {
          expect(e).toBeInstanceOf(NotificationError);
          expect(e.title).toBe('Invalid Identity Server');
        }
      });
    });
  });
});
