import moxios from 'moxios';
import { http } from '@/utils';

import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';
import userService from '@/services/user';

describe('User service', () => {
  beforeEach(() => {
    moxios.install(http);
  });

  afterEach(() => {
    moxios.uninstall(http);
  });

  describe('login', () => {
    const email = '123@email.com';
    const expectedError = new NotificationError({
      title: 'Auth error',
      text: 'Invalid or missing email address. Please, try again',
      type: 'is-danger',
    });
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.login(email);
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('post');
        expect(request.config.url).toBe(`${identityAPIUrl}/auth`);
        expect(request.config.data).toBe(JSON.stringify({ email }));

        done();
      });
    });

    it('should handle successfull POST /auth request', done => {
      const success = true;
      const challenge = { challenge_type: 'challenge_type' };

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success, challenge },
        });

        await expect(servicePromise).resolves.toBe(challenge.challenge_type);
        done();
      });
    });

    it('should handle failed POST /auth request', done => {
      const success = false;

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });

    it('should handle rejected POST /auth request', done => {
      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });
  });

  describe('loginViaOTP', () => {
    const code = 'code';
    const email = '123@email.com';
    const expectedError = new NotificationError({
      title: 'Auth error',
      text: 'Invalid or missing one time password. Please, try again',
      type: 'is-danger',
    });
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.loginViaOTP(code, email);
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('post');
        expect(request.config.url).toBe(`${identityAPIUrl}/token`);
        expect(request.config.data).toBe(
          JSON.stringify({
            challenge_type: 'otp',
            code,
            email,
          }),
        );

        done();
      });
    });

    it('should handle successfull POST /token request', done => {
      const success = true;

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });

        await expect(servicePromise).resolves.toBeUndefined();
        done();
      });
    });

    it('should handle failed POST /token request', done => {
      const success = false;

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });

    it('should handle rejected POST /token request', done => {
      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });
  });

  describe('logout', () => {
    const expectedError = new NotificationError({
      title: 'Log out error',
      text: 'Failed to log out. Please, try again',
      type: 'is-danger',
    });
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.logout();
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('post');
        expect(request.config.url).toBe(`${identityAPIUrl}/logout`);

        done();
      });
    });

    it('should handle rejected POST /logout request', done => {
      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });
  });

  describe('getSettings', () => {
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.getSettings();
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('get');
        expect(request.config.url).toBe(`${identityAPIUrl}/user`);

        done();
      });
    });

    it('should handle successfull GET /user request', done => {
      const expectedResponse = {};

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });

        await expect(servicePromise).resolves.toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('setSettings', () => {
    const settings = {
      settings: {
        fiatCurrency: 'USD',
      },
    };
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.setSettings(settings);
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('post');
        expect(request.config.url).toBe(`${identityAPIUrl}/user`);
        expect(request.config.data).toBe(JSON.stringify(settings));

        done();
      });
    });

    it('should handle successfull POST /user request', done => {
      const expectedResponse = {};

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });

        await expect(servicePromise).resolves.toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('getAccounts', () => {
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.getAccounts();
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('get');
        expect(request.config.url).toBe(`${identityAPIUrl}/accounts`);

        done();
      });
    });

    it('should handle successfull GET /accounts request', done => {
      const expectedResponse = {};

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });

        await expect(servicePromise).resolves.toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('getAccount', () => {
    const account = 'account';
    const shortAcc = account.replace(/^(.{5}).+/, '$1…');
    const expectedError = new NotificationError({
      title: 'Account request error',
      text: `Failed to get account ${shortAcc}. Please, reload page`,
      type: 'is-danger',
    });
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.getAccount(account);
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('get');
        expect(request.config.url).toBe(`${identityAPIUrl}/account/${account}`);

        done();
      });
    });

    it('should handle successfull GET /account request', done => {
      const expectedResponse = {};

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });

        await expect(servicePromise).resolves.toEqual(expectedResponse);
        done();
      });
    });

    it('should handle rejected GET /account request', done => {
      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });
  });

  describe('setAccount', () => {
    const account = {
      address: '0x123',
    };
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.setAccount(account.address, account);
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('post');
        expect(request.config.url).toBe(
          `${identityAPIUrl}/accounts/${account.address}`,
        );
        expect(request.config.data).toBe(JSON.stringify(account));

        done();
      });
    });

    it('should handle successfull POST /account request', done => {
      const expectedResponse = {};

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });

        await expect(servicePromise).resolves.toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('getOtpSettings', () => {
    const expectedError = new NotificationError({
      title: 'Error requesting two-factor authentication settings',
      text: `Failed to get OTP settings.`,
      type: 'is-danger',
    });
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.getOtpSettings();
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('get');
        expect(request.config.url).toBe(`${identityAPIUrl}/otp`);

        done();
      });
    });

    it('should handle successfull GET /otp request', done => {
      const expectedResponse = {};

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });

        await expect(servicePromise).resolves.toEqual(expectedResponse);
        done();
      });
    });

    it('should handle rejected GET /otp request', done => {
      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });
  });

  describe('setOtpSettings', () => {
    const secret = 'secret';
    const code = 'code';
    const expectedError = new NotificationError({
      title: 'Error saving two-factor authentication settings',
      text: `Failed to save OTP settings.`,
      type: 'is-danger',
    });
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.setOtpSettings(secret, code);
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('post');
        expect(request.config.url).toBe(`${identityAPIUrl}/otp`);
        expect(request.config.data).toBe(JSON.stringify({ secret, code }));

        done();
      });
    });

    it('should handle successfull POST /otp request', done => {
      const success = true;

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });

        await expect(servicePromise).resolves.toBeUndefined();
        done();
      });
    });

    it('should handle failed POST /otp request', done => {
      const success = false;

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });

    it('should handle rejected POST /otp request', done => {
      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });
  });

  describe('deleteOtpSettings', () => {
    const code = 'code';
    const expectedError = new NotificationError({
      title: 'Error removing two-factor authentication settings',
      text: `Failed to remove OTP settings.`,
      type: 'is-danger',
    });
    let servicePromise;

    beforeEach(() => {
      servicePromise = userService.deleteOtpSettings(code);
    });

    it('should make correct request', done => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        expect(request.config.method).toBe('delete');
        expect(request.config.url).toBe(`${identityAPIUrl}/otp`);
        expect(request.config.data).toBe(JSON.stringify({ code }));

        done();
      });
    });

    it('should handle successfull DELETE /otp request', done => {
      const success = true;

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });

        await expect(servicePromise).resolves.toBeUndefined();
        done();
      });
    });

    it('should handle failed DELETE /otp request', done => {
      const success = false;

      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });

    it('should handle rejected DELETE /otp request', done => {
      moxios.wait(async () => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });

        try {
          await servicePromise;
        } catch (receivedError) {
          expect(receivedError.name).toBe(expectedError.name);
          expect(receivedError.title).toBe(expectedError.title);
          expect(receivedError.text).toBe(expectedError.text);
          expect(receivedError.type).toBe(expectedError.type);
          done();
        }
      });
    });
  });
});
