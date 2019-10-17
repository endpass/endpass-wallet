import { NotificationError } from '@/class';
import { proxyRequest } from '@/class/singleton';
import { identityValidator } from '@/schema';
import i18n from '@/locales/i18n';

export default {
  async sendCode(email) {
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
        title: i18n.t('errors.getOtpSettings.title'),
        text: i18n.t('errors.getOtpSettings.text'),
        type: 'is-danger',
      });
    }
  },

  async setOtpSettings({ secret, code, verificationCode }) {
    try {
      const { success, message } = await proxyRequest.write('/settings/otp', {
        payload: {
          code,
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
        title: i18n.t('errors.setOtpSettings.title'),
        text: i18n.t('errors.setOtpSettings.text'),
        type: 'is-danger',
      });
    }
  },

  async deleteOtpSettings({ code }) {
    try {
      const { success, message } = await proxyRequest.remove(
        `/settings/otp?code=${code}`,
      );

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
        title: i18n.t('errors.deleteOtpSettings.title'),
        text: i18n.t('errors.deleteOtpSettings.text'),
        type: 'is-danger',
      });
    }
  },
};
