import { NotificationError } from '@/class';
import { allowedDomain, identityAPIUrl } from '@/config';
import { http } from '@/utils';
import keyUtil from '@/utils/keystore';

export default {
  login({ email, currentRoute }) {
    const fullRoute = `${allowedDomain}${currentRoute}`;

    return http
      .post(`${identityAPIUrl}/auth`, {
        email,
        redirect_uri: fullRoute,
      })
      .then(({ data: { success, challenge } }) => {
        if (!success) {
          return Promise.reject();
        }

        return challenge.challenge_type;
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Auth error',
          text: 'Invalid or missing email address. Please, try again',
          type: 'is-danger',
        });
      });
  },

  loginViaOTP(code, email) {
    return http
      .post(`${identityAPIUrl}/token`, {
        challenge_type: 'otp',
        code,
        email,
      })
      .then(({ data: { success } }) => {
        if (!success) {
          return Promise.reject();
        }
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
    return http.post(`${identityAPIUrl}/logout`).catch(() => {
      throw new NotificationError({
        title: 'Log out error',
        text: 'Failed to log out. Please, try again',
        type: 'is-danger',
      });
    });
  },

  getSettings() {
    return http.get(`${identityAPIUrl}/user`).then(({ data }) => data);
  },

  setSettings(settings) {
    return http
      .post(`${identityAPIUrl}/user`, settings)
      .then(({ data }) => data);
  },

  // removeSettings(propsArr) {
  //   return Promise.resolve({
  //     success: true,
  //   });

  //   return http
  //     .delete(`${identityAPIUrl}/user`, propsArr)
  //     .then(res => res.data)
  //     .then(console.log)
  //     .catch(console.log);
  // },

  // Returns addresses of all of the user's accounts
  getAccounts() {
    return http.get(`${identityAPIUrl}/accounts`).then(res => res.data);
  },

  // Saves the encrypted keystore for an account
  setAccount(address, account) {
    return http
      .post(`${identityAPIUrl}/accounts/${address}`, account)
      .then(res => res.data);
  },

  // Returns the encrypted keystore for a single account
  getAccount(address) {
    return http
      .get(`${identityAPIUrl}/account/${address}`)
      .then(res => {
        let account = res.data;
        account.address = address;
        return account;
      })
      .catch(() => {
        const shortAcc = address.replace(/^(.{5}).+/, '$1…');

        throw new NotificationError({
          title: 'Account request error',
          text: `Failed to get account ${shortAcc}. Please, reload page`,
          type: 'is-danger',
        });
      });
  },

  // Returns encrypted keystores for all non HD accounts
  // TODO refactor to remove this method and only get accounts as needed
  getV3Accounts() {
    return this.getAccounts()
      .then(accounts => {
        const allAcc = accounts
          .filter(acc => !keyUtil.isExtendedPublicKey(acc))
          .map(this.getAccount);
        return Promise.all(allAcc);
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Accounts request error',
          text: 'Failed to get user accounts. Please, reload page',
          type: 'is-danger',
        });
      });
  },

  // Returns the encrypted keystore for the user's HD wallet, if any
  // Right now, uses the first HD address found as a key
  getHDKey() {
    return this.getAccounts().then(accounts => {
      let hdAccounts = accounts.filter(acc => keyUtil.isExtendedPublicKey(acc));
      if (hdAccounts.length) {
        return this.getAccount(hdAccounts[0]);
      } else {
        return Promise.resolve();
      }
    });
  },

  getFullUserInfo() {
    return Promise.all([this.getSettings(), this.getV3Accounts()])
      .then(([settings, accounts]) => ({
        accounts,
        ...settings,
      }))
      .catch(() => {});
  },

  getOtpSettings() {
    return http
      .get(`${identityAPIUrl}/otp`)
      .then(res => res.data)
      .catch(() => {
        throw new NotificationError({
          title: 'Error requesting two-factor authentication settings',
          text: `Failed to get OTP settings.`,
          type: 'is-danger',
        });
      });
  },

  setOtpSettings(secret, code) {
    return http
      .post(`${identityAPIUrl}/otp`, { secret, code })
      .then(({ data: { success, message } }) => {
        if (!success) {
          console.warn(`POST ${identityAPIUrl}/otp: ${message}`);
          return Promise.reject();
        }
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Error saving two-factor authentication settings',
          text: `Failed to save OTP settings.`,
          type: 'is-danger',
        });
      });
  },

  deleteOtpSettings(code) {
    return http
      .delete(`${identityAPIUrl}/otp`, {
        data: { code },
      })
      .then(({ data: { success, message } }) => {
        if (!success) {
          console.warn(`DELETE ${identityAPIUrl}/otp: ${message}`);
          return Promise.reject();
        }
      })
      .catch(() => {
        throw new NotificationError({
          title: 'Error removing two-factor authentication settings',
          text: `Failed to remove OTP settings.`,
          type: 'is-danger',
        });
      });
  },
};
