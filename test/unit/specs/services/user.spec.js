import moxios from 'moxios';
import axios from 'axios';

import { NotificationError } from '@/class';
import userService from '@/services/user';

describe('User service', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  describe('login', () => {
    const email = '123@email.com';
    const expectedError = new NotificationError({
      title: 'Auth error',
      text: 'Invalid or missing email address. Please, try again',
      type: 'is-danger',
    });

    it('should handle successfull POST /auth request', () => {
      const success = true;
      const challenge = { challenge_type: 'challenge_type' };

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success, challenge },
        });
      });

      expect(userService.login(email)).resolves.toBe(challenge.challenge_type);
    });

    it('should handle failed POST /auth request', () => {
      const success = false;

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });
      });

      expect(userService.login(email)).rejects.toThrow(expectedError);
    });

    it('should handle rejected POST /auth request', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });
      });

      expect(userService.login(email)).rejects.toThrow(expectedError);
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

    it('should handle successfull POST /token request', () => {
      const success = true;

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });
      });

      expect(userService.loginViaOTP(code, email)).resolves.toBeUndefined(
        expectedError,
      );
    });

    it('should handle failed POST /token request', () => {
      const success = false;

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });
      });

      expect(userService.loginViaOTP(code, email)).rejects.toThrow(
        expectedError,
      );
    });

    it('should handle rejected POST /token request', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });
      });

      expect(userService.loginViaOTP(code, email)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('getSettings', () => {
    it('should handle successfull GET /user request', () => {
      const expectedResponse = {};

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });
      });

      expect(userService.getSettings()).resolves.toEqual(expectedResponse);
    });
  });

  describe('setSettings', () => {
    it('should handle successfull POST /user request', () => {
      const expectedResponse = {};
      const settings = {
        settings: {
          fiatCurrency: 'USD',
        },
      };

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });
      });

      expect(userService.getSettings()).resolves.toEqual(expectedResponse);
    });
  });

  describe('getAccounts', () => {
    it('should handle successfull GET /accounts request', () => {
      const expectedResponse = {};

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });
      });

      expect(userService.getAccounts()).resolves.toEqual(expectedResponse);
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

    it('should handle successfull GET /account request', () => {
      const expectedResponse = {};

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });
      });

      expect(userService.getAccount(account)).resolves.toEqual(
        expectedResponse,
      );
    });

    it('should handle rejected GET /account request', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });
      });

      expect(userService.getAccount(account)).rejects.toThrow(expectedError);
    });
  });

  describe('getOtpSettings', () => {
    const expectedError = new NotificationError({
      title: 'Error requesting two-factor authentication settings',
      text: `Failed to get OTP settings.`,
      type: 'is-danger',
    });

    it('should handle successfull GET /otp request', () => {
      const expectedResponse = {};

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: expectedResponse,
        });
      });

      expect(userService.getOtpSettings()).resolves.toEqual(expectedResponse);
    });

    it('should handle rejected GET /otp request', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });
      });

      expect(userService.getOtpSettings()).rejects.toThrow(expectedError);
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

    it('should handle successfull POST /otp request', () => {
      const success = true;

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });
      });

      expect(userService.setOtpSettings(secret, code)).resolves.toBeUndefined();
    });

    it('should handle failed POST /otp request', () => {
      const success = false;

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });
      });

      expect(userService.setOtpSettings(secret, code)).rejects.toThrow(
        expectedError,
      );
    });

    it('should handle rejected POST /otp request', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });
      });

      expect(userService.setOtpSettings(secret, code)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('deleteOtpSettings', () => {
    const code = 'code';
    const expectedError = new NotificationError({
      title: 'Error removing two-factor authentication settings',
      text: `Failed to remove OTP settings.`,
      type: 'is-danger',
    });

    it('should handle successfull DELETE /otp request', () => {
      const success = true;

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });
      });

      expect(userService.deleteOtpSettings(code)).resolves.toBeUndefined();
    });

    it('should handle failed DELETE /otp request', () => {
      const success = false;

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.respondWith({
          status: 200,
          response: { success },
        });
      });

      expect(userService.deleteOtpSettings(code)).rejects.toThrow(
        expectedError,
      );
    });

    it('should handle rejected DELETE /otp request', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();

        request.reject({
          status: 500,
        });
      });

      expect(userService.deleteOtpSettings(code)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
