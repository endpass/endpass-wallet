import { NotificationError } from '@/class';
import { httpIdentity } from '@/class/singleton';

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

      return challenge.challenge_type;
    } catch (e) {
      throw new NotificationError({
        title: 'Auth error',
        text: 'Invalid or missing email address. Please, try again',
        type: 'is-danger',
      });
    }
  },

  loginViaOTP(code, email) {
    return httpIdentity
      .post(`${ENV.identityAPIUrl}/token`, {
        challenge_type: 'otp',
        code,
        email,
      })
      .then(({ data: { success } }) => {
        if (!success) {
          return Promise.reject();
        }
        return { success };
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Auth error',
          text: 'Invalid or missing one time password. Please, try again',
          type: 'is-danger',
        });
      });
  },

  logout() {
    return httpIdentity.post(`${ENV.identityAPIUrl}/logout`).catch(() => {
      throw new NotificationError({
        title: 'Log out error',
        text: 'Failed to log out. Please, try again',
        type: 'is-danger',
      });
    });
  },
};
