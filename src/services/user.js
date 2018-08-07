import axios from 'axios';
import { NotificationError } from '@/class';
import { identityAPIUrl } from '@/config';

export default {
  login(email) {
    return axios
      .post(`${identityAPIUrl}/auth`, {
        email,
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

  loginViaOTP(code) {
    return axios
      .post(`${identityAPIUrl}/token`, {
        challenge_type: 'otp',
        code,
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

  getSettings() {
    return axios.get(`${identityAPIUrl}/user`).then(({ data }) => data);
  },

  setSettings(settings) {
    return axios
      .post(`${identityAPIUrl}/user`, settings)
      .then(({ data }) => data);
  },

  // removeSettings(propsArr) {
  //   return Promise.resolve({
  //     success: true,
  //   });

  //   return axios
  //     .delete(`${identityAPIUrl}/user`, propsArr)
  //     .then(res => res.data)
  //     .then(console.log)
  //     .catch(console.log);
  // },

  getAccounts() {
    return axios.get(`${identityAPIUrl}/accounts`).then(res => res.data);
  },

  setAccount(account) {
    return axios
      .post(`${identityAPIUrl}/accounts/${account.address}`, account)
      .then(res => res.data);
  },

  getAccount(account) {
    return axios
      .get(`${identityAPIUrl}/account/${account}`)
      .then(res => res.data)
      .catch(() => {
        const shortAcc = account.replace(/^(.{5}).+/, '$1…');

        throw new NotificationError({
          title: 'Account request error',
          text: `Failed to get account ${shortAcc}. Please, reload page`,
          type: 'is-danger',
        });
      });
  },

  getV3Accounts() {
    return this.getAccounts()
      .then(accounts => {
        const allAcc = accounts.map(this.getAccount);
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

  getFullUserInfo() {
    return Promise.all([this.getSettings(), this.getV3Accounts()])
      .then(([settings, accounts]) => ({
        accounts,
        ...settings,
      }))
      .catch(() => {});
  },

  getOtpSettings() {
    return axios
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
    return axios
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
    return axios
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
