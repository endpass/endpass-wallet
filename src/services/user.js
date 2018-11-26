import { proxyRequest } from '@/utils';
import { NotificationError } from '@/class';
import { httpIdentity } from '@/class/singleton';
import keyUtil from '@/utils/keystore';

export default {
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

  //   return httpIdentity
  //     .delete(`${ENV.identityAPIUrl}/user`, propsArr)
  //     .then(res => res.data)
  //     .then(console.log)
  //     .catch(console.log);
  // },

  // Returns addresses of all of the user's accounts
  getAccounts() {
    return proxyRequest.read('/accounts');
  },

  // Saves the encrypted keystore for an account
  async setAccount(address, { info = {}, ...rest }) {
    const account = Object.keys(rest).length ? rest : null;

    await proxyRequest.write(`/account/${address}`, {
      payload: account,
    });

    if (Object.keys(info).length) {
      await this.setAccountInfo(address, info);
    }
  },

  // Save the info for an account
  setAccountInfo(address, info) {
    return proxyRequest.write(`/account/${address}/info`, {
      payload: info,
    });
  },

  // Update the encrypted keystore for an existing accounts
  async updateAccounts(accounts) {
    try {
      return await httpIdentity
        .post(`${ENV.identityAPIUrl}/accounts`, accounts)
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
      let info;

      try {
        info = await proxyRequest.read(`/account/${address}/info`);
      } catch (e) {
        info = {};
      }

      return { ...account, address, info };
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
      const hdAccounts = accounts.filter(acc =>
        keyUtil.isExtendedPublicKey(acc),
      );

      if (hdAccounts.length === 0) {
        return Promise.resolve();
      }

      return this.getAccount(hdAccounts[0]);
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
        throw new Error(`POST ${ENV.identityAPIUrl}/otp: ${message}`);
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
        throw new Error(`DELETE ${ENV.identityAPIUrl}/otp: ${message}`);
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
};
