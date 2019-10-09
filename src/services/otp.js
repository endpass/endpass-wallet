import mapToQueryString from '@endpass/utils/mapToQueryString';
import { NotificationError } from '@/class';
import { proxyRequest } from '@/class/singleton';
import { identityValidator } from '@/schema';

export default {
  async requestCode(email) {
    await proxyRequest.write('/auth/code', {
      payload: {
        email,
      },
    });
  },

  async getOtpSettings() {
    try {
      const otpSetting = await proxyRequest.read('/settings/otp');

      return identityValidator.validateUserOtpSetting(otpSetting);
    } catch (e) {
      throw new NotificationError({
        title: 'Error requesting two-factor authentication settings',
        text: 'Failed to get OTP settings.',
        type: 'is-danger',
      });
    }
  },

  async setOtpSettings({ secret, otpCode, verificationCode }) {
    try {
      const { success, message } = await proxyRequest.write('/settings/otp', {
        payload: {
          code: otpCode,
          secret,
        },
        headers: {
          'X-Request-Code': verificationCode,
        },
      });

      if (!success) {
        throw new Error(
          `POST ${ENV.VUE_APP_IDENTITY_API_URL}/settings/otp: ${message}`,
        );
      }

      return { success };
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error saving two-factor authentication settings',
        text: 'Failed to save OTP settings.',
        type: 'is-danger',
      });
    }
  },

  async deleteOtpSettings({ otpCode, verificationCode }) {
    try {
      const requestUrl = mapToQueryString('/settings/otp', {
        code: otpCode,
      });
      const { success, message } = await proxyRequest.remove(requestUrl, {
        headers: {
          'X-Request-Code': verificationCode,
        },
      });

      if (!success) {
        throw new Error(
          `DELETE ${ENV.VUE_APP_IDENTITY_API_URL}/settings/otp: ${message}`,
        );
      }

      return { success };
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error removing two-factor authentication settings',
        text: 'Failed to remove OTP settings.',
        type: 'is-danger',
      });
    }
  },
};
