import MockAdapter from 'axios-mock-adapter';

import { NotificationError, httpIdentity } from '@/class';

const authService = require.requireActual('@/services/auth').default;

describe('Auth service', () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(httpIdentity);
  });

  describe('login', () => {
    const redirectUri = '/send?to=0x1234&amount=0.1';
    const url = `${
      ENV.identityAPIUrl
    }/auth?redirect_uri=%2Fsend%3Fto%3D0x1234%26amount%3D0.1`;
    const email = '123@email.com';

    const successResp = {
      success: true,
      challenge: {
        challengeType: 'emailAuth',
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

      await authService.login({ email, redirectUri });
    });

    it('should handle successfull POST /auth request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(200, successResp);

      const challengeType = await authService.login({ email, redirectUri });

      expect(challengeType).toBe(successResp.challenge.challengeType);
    });

    it('should handle failed POST /auth request', async () => {
      axiosMock.onPost(url).reply(200, { success: false });
      try {
        await authService.login(email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected POST /auth request', async () => {
      axiosMock.onPost(url).reply(500, {});
      try {
        await authService.login(email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('loginViaOTP', () => {
    const code = 'code';
    const email = '123@email.com';
    const url = `${ENV.identityAPIUrl}/auth/token`;
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
            challengeType: 'otp',
            code,
            email,
          }),
        );
        return [200, successResp];
      });
      await authService.loginViaOTP(code, email);
    });

    it('should handle successfull POST /auth/token request', async () => {
      axiosMock.onPost(url).reply(200, successResp);
      const resp = await authService.loginViaOTP(code, email);
      expect(resp).toEqual(successResp);
    });

    it('should handle failed POST /auth/token request', async () => {
      axiosMock.onPost(url).reply(200, { success: false });
      try {
        await authService.loginViaOTP(code, email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });

    it('should handle rejected POST /auth/token request', async () => {
      axiosMock.onPost(url).reply(500, { success: false });
      try {
        await authService.loginViaOTP(code, email);
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('logout', () => {
    const url = `${ENV.identityAPIUrl}/logout`;
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

      await authService.logout();
    });

    it('should handle rejected POST /logout request', async () => {
      axiosMock.onPost(url).reply(500, {});
      try {
        await authService.logout();
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });
});
