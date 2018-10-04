import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';
import { http, proxyRequest } from '@/utils';
import keyUtil from '@/utils/keystore';
import { IDENTITY_MODE } from '@/constants';

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

  async getSettings() {
    try {
      return await proxyRequest.read('/user');
    } catch (e) {
      return {};
    }
  },

  async getSetting(setting) {
    const allSettings = await this.getSettings();
    return allSettings[setting];
  },

  setSettings(settings) {
    return proxyRequest.add('/user', {
      payload: settings,
      prop: 'settings',
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
    return proxyRequest.read('/accounts');
  },

  // Saves the encrypted keystore for an account
  setAccount(address, account) {
    return proxyRequest.write(`/account/${address}`, {
      payload: account,
    });
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
  async getAccount(address) {
    try {
      const account = await proxyRequest.read(`/account/${address}`);
      return { ...account, address };
    } catch (e) {
      const shortAcc = address.replace(/^(.{5}).+/, '$1…');

      throw new NotificationError({
        title: 'Account request error',
        text: `Failed to get account ${shortAcc}. Please, reload page`,
        type: 'is-danger',
      });
    }
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

  async getOtpSettings() {
    try {
      return await proxyRequest.read('/otp');
    } catch (e) {
      throw new NotificationError({
        title: 'Error requesting two-factor authentication settings',
        text: `Failed to get OTP settings.`,
        type: 'is-danger',
      });
    }
  },

  async setOtpSettings(secret, code) {
    try {
      const { success, message } = await proxyRequest.write('/otp', {
        payload: { secret, code },
      });

      if (!success) {
        throw new Error(`POST ${identityAPIUrl}/otp: ${message}`);
      }

      return { success };
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error saving two-factor authentication settings',
        text: `Failed to save OTP settings.`,
        type: 'is-danger',
      });
    }
  },

  async deleteOtpSettings(code) {
    try {
      const { success, message } = await proxyRequest.remove('/otp', {
        payload: {
          data: { code },
        },
      });

      if (!success) {
        throw new Error(`DELETE ${identityAPIUrl}/otp: ${message}`);
      }

      return { success };
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error removing two-factor authentication settings',
        text: `Failed to remove OTP settings.`,
        type: 'is-danger',
      });
    }
  },

  setIdentityMode(type, serverUrl) {
    try {
      const mode = JSON.stringify({ type, serverUrl });
      localStorage.setItem('identityMode', mode);
      proxyRequest.setMode(type, serverUrl);
    } catch (e) {
      throw new NotificationError({
        title: 'Error in local storage',
        text:
          'Can`t work in the current mode. Please change the mode or try again.',
        type: 'is-danger',
      });
    }
  },

  getIdentityMode() {
    const defaultMode = { type: IDENTITY_MODE.DEFAULT };

    try {
      const mode = localStorage.getItem('identityMode');
      return JSON.parse(mode) || defaultMode;
    } catch (e) {
      return defaultMode;
    }
  },

  async deleteIdentityData() {
    try {
      await proxyRequest.clear();
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error deleting identity data',
        text: `Failed to remove identity data.`,
        type: 'is-danger',
      });
    }
  },
};
