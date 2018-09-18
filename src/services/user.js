import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';
import { http } from '@/utils';
import keyUtil from '@/utils/keystore';

export default {
  async login({ email, redirectUri = '/' }) {
    try {
      const encodedUri = encodeURIComponent(redirectUri);
      const requestUrl = `${identityAPIUrl}/auth?redirect_uri=${encodedUri}`;
      const { data } = await http.post(requestUrl, { email });
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

  getSetting(setting) {
    return this.getSettings().then(data => {
      return data[setting];
    });
  },

  setSettings(settings) {
    return http
      .post(`${identityAPIUrl}/user`, settings)
      .then(({ data }) => data)
      .catch(() => {
        throw new NotificationError({
          title: 'Error in server storage',
          text: "Can't save data to server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  },

  setSetting(prop, data) {
    return this.setSettings({
      [prop]: data,
    });
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
      .post(`${identityAPIUrl}/account/${address}`, account)
      .then(res => res.data);
  },

  // Update the encrypted keystore for an existing accounts
  async updateAccounts(accounts) {
    try {
      return await http
        .post(`${identityAPIUrl}/accounts`, accounts)
        .then(({ data }) => data);
    } catch (error) {
      throw new NotificationError({
        title: 'Error updating accounts',
        text: `An error occurred updating accounts. Please try again later`,
        type: 'is-danger',
      });
    }
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
      .catch(e => {
        if (e.response && e.response.status === 401) {
          throw e;
        }

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
        return { success };
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
        return { success };
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
