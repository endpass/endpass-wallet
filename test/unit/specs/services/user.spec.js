import MockAdapter from 'axios-mock-adapter';

import { NotificationError, httpIdentity } from '@/class';
import { WALLET_TYPE } from '@/constants';
import { successResponse } from 'fixtures/identity';

const userService = require.requireActual('@/services/user').default;

describe('User service', () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(httpIdentity);
  });

  describe('getSettings', () => {
    const url = `${ENV.identityAPIUrl}/settings`;
    const successResp = {
      fiatCurrency: 'USD',
    };

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successResp];
      });

      await userService.getSettings();
    });

    it('should handle successfull GET /settings request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, successResp);

      const settings = await userService.getSettings();

      expect(settings).toEqual(successResp);
    });
  });

  describe('setSettings', () => {
    const settings = {
      fiatCurrency: 'USD',
    };
    const url = `${ENV.identityAPIUrl}/settings`;

    it('should make correct request', async () => {
      expect.assertions(3);

      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify(settings));

        return [200, successResponse];
      });

      await userService.setSettings(settings);
    });

    it('should handle successful POST /user request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(200, successResponse);

      const resp = await userService.setSettings(settings);

      expect(resp).toEqual(successResponse);
    });
  });

  describe('Tokens', () => {
    const net = 1;
    const address = 'address';
    const token = { address };
    const url = `${ENV.identityAPIUrl}/tokens/${net}/${address}`;

    describe('addToken', () => {
      it('should make correct request', async () => {
        expect.assertions(2);

        axiosMock.onPost(url).reply(config => {
          expect(config.url).toBe(url);
          expect(config.data).toBe(JSON.stringify(token));

          return [200, successResponse];
        });

        await userService.addToken(net, token);
      });

      it('should handle successful POST /tokens request', async () => {
        expect.assertions(1);

        axiosMock.onPost(url).reply(200, successResponse);

        const resp = await userService.addToken(net, token);

        expect(resp).toEqual(successResponse);
      });

      it('should handle rejected POST /tokens request', async () => {
        expect.assertions(1);

        axiosMock.onPost(url).reply(401);

        await expect(userService.addToken(net, token)).rejects.toThrow(
          expect.any(NotificationError),
        );
      });
    });

    describe('removeToken', () => {
      it('should make correct request', async () => {
        expect.assertions(1);

        axiosMock.onDelete(url).reply(config => {
          expect(config.url).toBe(url);

          return [200, successResponse];
        });

        await userService.removeToken(net, address);
      });

      it('should handle successful DELETE /tokens request', async () => {
        expect.assertions(1);

        axiosMock.onDelete(url).reply(200, successResponse);

        const resp = await userService.removeToken(net, address);

        expect(resp).toEqual(successResponse);
      });

      it('should handle rejected DELETE /tokens request', async () => {
        expect.assertions(1);

        axiosMock.onDelete(url).reply(401);

        await expect(userService.removeToken(net, address)).rejects.toThrow(
          expect.any(NotificationError),
        );
      });
    });
  });

  describe('Networks', () => {
    const netUrl = 'address';
    const network = { url: netUrl };
    const url = `${ENV.identityAPIUrl}/networks/${netUrl}`;

    describe('addNetwork', () => {
      it('should make correct request', async () => {
        expect.assertions(2);

        axiosMock.onPost(url).reply(config => {
          expect(config.url).toBe(url);
          expect(config.data).toBe(JSON.stringify(network));

          return [200, successResponse];
        });

        await userService.addNetwork(network);
      });

      it('should handle successful POST /networks request', async () => {
        expect.assertions(1);

        axiosMock.onPost(url).reply(200, successResponse);

        const resp = await userService.addNetwork(network);

        expect(resp).toEqual(successResponse);
      });

      it('should handle rejected POST /networks request', async () => {
        expect.assertions(1);

        axiosMock.onPost(url).reply(401);

        await expect(userService.addNetwork(network)).rejects.toThrow(
          expect.any(NotificationError),
        );
      });
    });

    describe('updateNetwork', () => {
      const oldUrl = 'old';
      const urlForUpdate = `${ENV.identityAPIUrl}/networks/${oldUrl}`;

      it('should make correct request', async () => {
        expect.assertions(2);

        axiosMock.onPost(urlForUpdate).reply(config => {
          expect(config.url).toBe(urlForUpdate);
          expect(config.data).toBe(JSON.stringify(network));

          return [200, successResponse];
        });

        await userService.updateNetwork(oldUrl, network);
      });

      it('should handle successful POST /networks request', async () => {
        expect.assertions(1);

        axiosMock.onPost(urlForUpdate).reply(200, successResponse);

        const resp = await userService.updateNetwork(oldUrl, network);

        expect(resp).toEqual(successResponse);
      });

      it('should handle rejected POST /networks request', async () => {
        expect.assertions(1);

        axiosMock.onPost(urlForUpdate).reply(401);

        await expect(
          userService.updateNetwork(oldUrl, network),
        ).rejects.toThrow(expect.any(NotificationError));
      });
    });

    describe('removeNetwork', () => {
      it('should make correct request', async () => {
        expect.assertions(1);

        axiosMock.onDelete(url).reply(config => {
          expect(config.url).toBe(url);

          return [200, successResponse];
        });

        await userService.removeNetwork(network.url);
      });

      it('should handle successful DELETE /tokens request', async () => {
        expect.assertions(1);

        axiosMock.onDelete(url).reply(200, successResponse);

        const resp = await userService.removeNetwork(network.url);

        expect(resp).toEqual(successResponse);
      });

      it('should handle rejected DELETE /tokens request', async () => {
        expect.assertions(1);

        axiosMock.onDelete(url).reply(401);

        await expect(userService.removeNetwork(network.url)).rejects.toThrow(
          expect.any(NotificationError),
        );
      });
    });
  });

  describe('getAccounts', () => {
    const url = `${ENV.identityAPIUrl}/accounts`;
    const successResp = ['0x123', 'xpub1234'];

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successResp];
      });

      await userService.getAccounts();
    });

    it('should handle successful GET /accounts request', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(200, successResp);

      const accounts = await userService.getAccounts();

      expect(accounts.length).toBe(2);
      expect(accounts[0]).toEqual(successResp[0]);
    });
  });

  describe('getAccount', () => {
    const address = '0x456';
    const url = `${ENV.identityAPIUrl}/account/${address}`;
    const shortAcc = address.replace(/^(.{5}).+/, '$1…');
    const successResp = {};
    const expectedError = new NotificationError({
      title: 'Account request error',
      text: `Failed to get account ${shortAcc}. Please, reload page`,
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successResp];
      });

      await userService.getAccount(address);
    });

    it('should handle successfull GET /account request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, successResp);

      const account = await userService.getAccount(address);
      // Address should be automatically appended by getAccount
      expect(account).toEqual({ address, info: {} });
    });

    it('should handle rejected GET /account request', async () => {
      expect.assertions(1);

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
    const url = `${ENV.identityAPIUrl}/account/${address}`;

    it('should make correct request', async () => {
      expect.assertions(3);

      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify(account));

        return [200, successResponse];
      });

      await userService.setAccount(address, account);
    });
  });

  describe('setAccountInfo', () => {
    const address = '0x123';
    // Account data can be anything
    const url = `${ENV.identityAPIUrl}/account/${address}/info`;
    const info = { one: 'two' };

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.data).toBe(JSON.stringify(info));

        return [200, successResponse];
      });

      await userService.setAccountInfo(address, info);
    });
  });

  describe('updateAccounts', () => {
    const url = `${ENV.identityAPIUrl}/accounts`;
    const accounts = {
      'address 1': {},
      'address 2': {},
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
      expect.assertions(1);

      axiosMock.onPost(url).reply(200, successResponse);

      const response = await userService.updateAccounts(accounts);

      expect(response).toEqual(successResponse);
    });

    it('should handle rejected GET /accounts request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(404);

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
      expect.assertions(3);

      axiosMock.onGet(`${ENV.identityAPIUrl}/accounts`).reply(200, addrs);
      axiosMock
        .onGet(new RegExp(`${ENV.identityAPIUrl}/account/.+`))
        .reply(200, {});

      const accounts = await userService.getV3Accounts();
      const info = {};

      expect(accounts.length).toBe(2);
      expect(accounts[0]).toEqual({ address: '0x123', info });
      expect(accounts[1]).toEqual({ address: '0x456', info });
    });

    it('should return the HD key if it exists', async () => {
      expect.assertions(2);

      axiosMock.onGet(`${ENV.identityAPIUrl}/accounts`).reply(200, addrs);
      axiosMock
        .onGet(new RegExp(`${ENV.identityAPIUrl}/account/.+`))
        .reply(200, {});

      const account = await userService.getHDKey();

      expect(account).toBeTruthy();
      expect(account.address).toBe('xpubabcde');
    });

    it('should return the main HD key if it exists', async () => {
      expect.assertions(2);

      const mainAddress = 'xpub12345';
      const addresses = [...addrs, mainAddress];

      axiosMock.onGet(`${ENV.identityAPIUrl}/accounts`).reply(200, addresses);
      axiosMock
        .onGet(`${ENV.identityAPIUrl}/account/${mainAddress}/info`)
        .reply(200, { type: WALLET_TYPE.HD_MAIN });
      axiosMock
        .onGet(new RegExp(`${ENV.identityAPIUrl}/account/.+`))
        .reply(200, {});

      const account = await userService.getHDKey();

      expect(account).toBeTruthy();
      expect(account.address).toBe(mainAddress);
    });
  });

  describe('getOtpSettings', () => {
    const url = `${ENV.identityAPIUrl}/settings/otp`;
    const successResp = {
      secret: 'abc',
    };
    const expectedError = new NotificationError({
      title: 'Error requesting two-factor authentication settings',
      text: `Failed to get OTP settings.`,
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successResp];
      });

      await userService.getOtpSettings();
    });

    it('should handle successful GET /otp request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, successResp);

      const otp = await userService.getOtpSettings();

      expect(otp).toEqual(successResp);
    });

    it('should handle rejected GET /otp request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(500, {});

      try {
        await userService.getOtpSettings();
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('setOtpSettings', () => {
    const url = `${ENV.identityAPIUrl}/settings/otp`;
    const secret = 'secret';
    const code = 'code';
    const expectedError = new NotificationError({
      title: 'Error saving two-factor authentication settings',
      text: `Failed to save OTP settings.`,
      type: 'is-danger',
    });
    const errorMessage = 'server error';

    it('should make correct request', async () => {
      expect.assertions(3);

      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify({ secret, code }));

        return [200, successResponse];
      });

      await userService.setOtpSettings(secret, code);
    });

    it('should handle successful POST /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(200, successResponse);

      const resp = await userService.setOtpSettings(secret, code);

      expect(resp).toEqual(successResponse);
    });

    it('should handle failed POST /settings/otp request', async () => {
      expect.assertions(1);

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

    it('should handle rejected POST /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(500, {});

      try {
        await userService.setOtpSettings();
      } catch (receivedError) {
        expect(receivedError.text).toEqual(expectedError.text);
      }
    });
  });

  describe('deleteOtpSettings', () => {
    const url = `${ENV.identityAPIUrl}/settings/otp`;
    const code = 'code';
    const expectedError = new NotificationError({
      title: 'Error removing two-factor authentication settings',
      text: `Failed to remove OTP settings.`,
      type: 'is-danger',
    });
    const errorMessage = 'server error';

    it('should make correct request', async () => {
      expect.assertions(3);

      axiosMock.onDelete(url).reply(config => {
        expect(config.method).toBe('delete');
        expect(config.url).toBe(url);
        expect(config.data).toBe(JSON.stringify({ code }));

        return [200, successResponse];
      });

      await userService.deleteOtpSettings(code);
    });

    it('should handle successful DELETE /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onDelete(url).reply(200, successResponse);

      const resp = await userService.deleteOtpSettings(code);

      expect(resp).toEqual(successResponse);
    });

    it('should handle failed DELETE /settings/otp request', async () => {
      expect.assertions(1);

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

    it('should handle rejected DELETE /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onDelete(url).reply(500, {});

      try {
        await userService.deleteOtpSettings(code);
      } catch (receivedError) {
        expect(receivedError.text).toEqual(expectedError.text);
      }
    });
  });
});
