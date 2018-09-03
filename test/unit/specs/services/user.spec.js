import { http } from '@/utils';
import MockAdapter from 'axios-mock-adapter';

import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';
import userService from '@/services/user';

describe('User service', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(http);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('login', () => {
    const url = `${identityAPIUrl}/auth`;
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
      mock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify({ email }));

        return [200, successResp];
      });
      await userService.login(email);
    });

    it('should handle successfull POST /auth request', async () => {
      mock.onPost(url).reply(200, successResp);
      let challengeType = await userService.login(email);

      expect(challengeType).toBe(successResp.challenge.challenge_type);
    });

    it('should handle failed POST /auth request', async () => {
      mock.onPost(url).reply(200, { success: false });
      try {
        await userService.login(email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected POST /auth request', async () => {
      mock.onPost(url).reply(500, {});
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
      mock.onPost(url).reply(config => {
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
      mock.onPost(url).reply(200, successResp);
      let resp = await userService.loginViaOTP(code, email);
      expect(resp).toEqual(successResp);
    });

    it('should handle failed POST /token request', async () => {
      mock.onPost(url).reply(200, { success: false });
      try {
        await userService.loginViaOTP(code, email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected POST /token request', async () => {
      mock.onPost(url).reply(500, { success: false });
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
      mock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        return [200, {}];
      });
      await userService.logout();
    });

    it('should handle rejected POST /logout request', async () => {
      mock.onPost(url).reply(500, {});
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
      mock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getSettings();
    });

    it('should handle successfull GET /user request', async () => {
      mock.onGet(url).reply(200, successResp);
      let settings = await userService.getSettings();
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
      mock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify(settings));
        return [200, successResp];
      });
      await userService.setSettings(settings);
    });

    it('should handle successful POST /user request', async () => {
      mock.onPost(url).reply(200, successResp);
      let resp = await userService.setSettings(settings);
      expect(resp).toEqual(successResp);
    });
  });

  describe('getAccounts', () => {
    const url = `${identityAPIUrl}/accounts`;
    const successResp = ['0x123', 'xpub1234'];

    it('should make correct request', async () => {
      mock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getAccounts();
    });

    it('should handle successful GET /accounts request', async () => {
      mock.onGet(url).reply(200, successResp);
      let accounts = await userService.getAccounts();
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
      mock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getAccount(address);
    });

    it('should handle successfull GET /account request', async () => {
      mock.onGet(url).reply(200, successResp);
      let account = await userService.getAccount(address);
      // Address should be automatically appended by getAccount
      expect(account).toEqual({ address: address });
    });

    it('should handle rejected GET /account request', async () => {
      mock.onGet(url).reply(404);
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
    const url = `${identityAPIUrl}/accounts/${address}`;
    const successResp = {
      success: true,
    };

    it('should make correct request', async () => {
      mock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify(account));
        return [200, successResp];
      });
      await userService.setAccount(address, account);
    });

    it('should handle successful POST /account request', async () => {
      mock.onPost(url).reply(200, successResp);
      let resp = await userService.setAccount(address, account);
      expect(resp).toEqual(successResp);
    });
  });

  describe('HD Accounts', () => {
    const addrs = ['0x123', 'xpubabcde', '0x456'];

    it('should return keystores for regular accounts only', async () => {
      mock.onGet(`${identityAPIUrl}/accounts`).reply(200, addrs);
      mock.onGet(new RegExp(`${identityAPIUrl}/account/.+`)).reply(200, {});

      let accounts = await userService.getV3Accounts();
      expect(accounts.length).toBe(2);
      expect(accounts[0]).toEqual({ address: '0x123' });
      expect(accounts[1]).toEqual({ address: '0x456' });
    });

    it('should return the HD key if it exists', async () => {
      mock.onGet(`${identityAPIUrl}/accounts`).reply(200, addrs);
      mock.onGet(new RegExp(`${identityAPIUrl}/account/.+`)).reply(200, {});

      let account = await userService.getHDKey();
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
      mock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);
        return [200, successResp];
      });
      await userService.getOtpSettings();
    });

    it('should handle successful GET /otp request', async () => {
      mock.onGet(url).reply(200, successResp);
      let otp = await userService.getOtpSettings();
      expect(otp).toEqual(successResp);
    });

    it('should handle rejected GET /otp request', async () => {
      mock.onGet(url).reply(500, {});
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

    it('should make correct request', async () => {
      mock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify({ secret, code }));
        return [200, successResp];
      });
      await userService.setOtpSettings(secret, code);
    });

    it('should handle successful POST /otp request', async () => {
      mock.onPost(url).reply(200, successResp);
      let resp = await userService.setOtpSettings(secret, code);
      expect(resp).toEqual(successResp);
    });

    it('should handle failed POST /otp request', async () => {
      mock.onPost(url).reply(200, { success: false });
      try {
        await userService.setOtpSettings(secret, code);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected POST /otp request', async () => {
      mock.onPost(url).reply(500, {});
      try {
        await userService.setOtpSettings();
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
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

    it('should make correct request', async () => {
      mock.onDelete(url).reply(config => {
        expect(config.method).toBe('delete');
        expect(config.url).toBe(`${identityAPIUrl}/otp`);
        expect(config.data).toBe(JSON.stringify({ code }));
        return [200, successResp];
      });
      await userService.deleteOtpSettings(code);
    });

    it('should handle successful DELETE /otp request', async () => {
      mock.onDelete(url).reply(200, successResp);
      let resp = await userService.deleteOtpSettings(code);
      expect(resp).toEqual(successResp);
    });

    it('should handle failed DELETE /otp request', async () => {
      mock.onDelete(url).reply(200, { success: false });
      try {
        await userService.deleteOtpSettings(code);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected DELETE /otp request', async () => {
      mock.onDelete(url).reply(500, {});
      try {
        await userService.deleteOtpSettings(code);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });
});
