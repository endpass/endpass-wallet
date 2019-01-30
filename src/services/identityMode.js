import axios from 'axios';
import { NotificationError, proxyRequest } from '@/class';
import { IDENTITY_MODE } from '@/constants';

const STORAGE_KEY = 'identityMode';

export default {
  setIdentityMode(type, serverUrl) {
    try {
      const mode = JSON.stringify({ type, serverUrl });
      localStorage.setItem(STORAGE_KEY, mode);
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
      const mode = localStorage.getItem(STORAGE_KEY);
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

  async validateIdentityServer(serverUrl) {
    try {
      const { data: accounts } = await axios.get(`${serverUrl}/accounts`, {
        withCredentials: true,
      });

      if (!Array.isArray(accounts) || !accounts.length) {
        throw new NotificationError({
          title: 'No Accounts',
          text:
            'Your identity server does not have any accounts. Please add some accounts with your identity provider and reload this page.',
          type: 'is-danger',
        });
      }

      return true;
    } catch (e) {
      if (e instanceof NotificationError) {
        throw e;
      }

      const respCode = e.response && e.response.status;

      switch (respCode) {
        case 401:
          throw new NotificationError({
            title: 'Not Logged In',
            text:
              'You are not logged in at your identity server. Please log in with your identity provider, come back to this page, and try again.',
            type: 'is-danger',
          });

        default:
          throw new NotificationError({
            title: 'Invalid Identity Server',
            text:
              'The URL you have entered does not point to a valid identity server. Please double check the address and try again.',
            type: 'is-danger',
          });
      }
    }
  },
};
