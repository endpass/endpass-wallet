import MockAdapter from 'axios-mock-adapter';
import { successResponse } from 'fixtures/identity';
import { otpPayload } from 'fixtures/accounts';
import { httpIdentity } from '@/class/singleton';
import { NotificationError } from '@/class';

const otpService = require.requireActual('@/services/otp').default;

describe('OTP Service', () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(httpIdentity);
  });

  describe('getOtpSettings', () => {
    const url = `${ENV.VUE_APP_IDENTITY_API_URL}/settings/otp`;
    const successResp = {
      secret: 'abc',
    };
    const expectedError = new NotificationError({
      title: 'Error requesting two-factor authentication settings',
      text: 'Failed to get OTP settings.',
      type: 'is-danger',
    });

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successResp];
      });

      await otpService.getOtpSettings();
    });

    it('should handle successful GET /otp request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, successResp);

      const otp = await otpService.getOtpSettings();

      expect(otp).toEqual(successResp);
    });

    it('should handle rejected GET /otp request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(500, {});

      try {
        await otpService.getOtpSettings();
      } catch (receivedError) {
        expect(receivedError).toEqual(expectedError);
      }
    });
  });

  describe('setOtpSettings', () => {
    const url = `${ENV.VUE_APP_IDENTITY_API_URL}/settings/otp`;
    const expectedError = new NotificationError({
      title: 'Error saving two-factor authentication settings',
      text: 'Failed to save OTP settings.',
      type: 'is-danger',
    });
    const errorMessage = 'server error';

    it('should make correct request', async () => {
      expect.assertions(4);

      axiosMock.onPost(url).reply(config => {
        expect(config.method).toBe('post');
        expect(config.url).toBe(url);
        expect(config.data).toBe(
          JSON.stringify({
            code: otpPayload.code,
            secret: otpPayload.secret,
          }),
        );
        expect(config.headers['X-Request-Code']).toBe(
          otpPayload.verificationCode,
        );

        return [200, successResponse];
      });

      await otpService.setOtpSettings(otpPayload);
    });

    it('should handle successful POST /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(200, successResponse);

      const resp = await otpService.setOtpSettings(otpPayload);

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
        await otpService.setOtpSettings(otpPayload);
      } catch (receivedError) {
        expect(receivedError).toEqual(error);
      }
    });

    it('should handle rejected POST /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(500, {});

      try {
        await otpService.setOtpSettings(otpPayload);
      } catch (receivedError) {
        expect(receivedError.text).toEqual(expectedError.text);
      }
    });
  });

  describe('deleteOtpSettings', () => {
    const requestBaseUrl = `${ENV.VUE_APP_IDENTITY_API_URL}/settings/otp`;
    const url = `${requestBaseUrl}?code=${otpPayload.code}`;
    const expectedError = new NotificationError({
      title: 'Error removing two-factor authentication settings',
      text: 'Failed to remove OTP settings.',
      type: 'is-danger',
    });
    const errorMessage = 'server error';

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onDelete(url).reply(config => {
        expect(config.method).toBe('delete');
        expect(config.url).toBe(url);

        return [200, successResponse];
      });

      await otpService.deleteOtpSettings(otpPayload);
    });

    it('should handle successful DELETE /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onDelete(url).reply(200, successResponse);

      const resp = await otpService.deleteOtpSettings(otpPayload);

      expect(resp).toEqual(successResponse);
    });

    it('should handle failed DELETE /settings/otp request', async () => {
      expect.assertions(1);

      const error = new NotificationError({
        ...expectedError,
        message: `DELETE ${requestBaseUrl}: ${errorMessage}`,
      });

      axiosMock
        .onDelete(url)
        .reply(200, { success: false, message: errorMessage });

      try {
        await otpService.deleteOtpSettings(otpPayload);
      } catch (receivedError) {
        expect(receivedError).toEqual(error);
      }
    });

    it('should handle rejected DELETE /settings/otp request', async () => {
      expect.assertions(1);

      axiosMock.onDelete(url).reply(500, {});

      try {
        await otpService.deleteOtpSettings(otpPayload);
      } catch (receivedError) {
        expect(receivedError.text).toEqual(expectedError.text);
      }
    });
  });
});
