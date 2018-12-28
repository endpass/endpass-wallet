import { NotificationError, httpIdentity } from '@/class';

export default {
  async login({ email, redirectUri = '/' }) {
    try {
      const encodedUri = encodeURIComponent(redirectUri);
      const requestUrl = `${
        ENV.identityAPIUrl
      }/auth?redirect_uri=${encodedUri}`;
      const { data } = await httpIdentity.post(requestUrl, { email });
      const { success, challenge } = data;

      if (!success) {
        throw new Error();
      }

      return challenge.challengeType;
    } catch (e) {
      throw new NotificationError({
        title: 'Auth error',
        text: 'Invalid or missing email address. Please, try again',
        type: 'is-danger',
      });
    }
  },

  async loginViaOTP(code, email) {
    try {
      const {
        data: { success },
      } = await httpIdentity.post(`${ENV.identityAPIUrl}/auth/token`, {
        challengeType: 'otp',
        code,
        email,
      });

      if (!success) {
        throw new Error('Login error');
      }

      return { success };
    } catch (error) {
      throw new NotificationError({
        title: 'Auth error',
        text: 'Invalid or missing one time password. Please, try again',
        type: 'is-danger',
      });
    }
  },

  async logout() {
    try {
      return await httpIdentity.post(`${ENV.identityAPIUrl}/logout`);
    } catch (e) {
      throw new NotificationError({
        title: 'Log out error',
        text: 'Failed to log out. Please, try again',
        type: 'is-danger',
      });
    }
  },
};
