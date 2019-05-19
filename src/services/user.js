import { NotificationError, Wallet } from '@/class';
import { proxyRequest } from '@/class/singleton';
import { keystore } from '@endpass/utils';
import { identityValidator, v3KeystoreValidator } from '@/schema';
import get from 'lodash/get';

const WALLET_TYPES = Wallet.getTypes();

export default {
  async getSettings() {
    try {
      const settings = await proxyRequest.read('/settings');
      return identityValidator.validateUserSettings(settings);
    } catch (e) {
      return {};
    }
  },

  setSettings(settings) {
    return proxyRequest.add('/settings', {
      payload: settings,
      prop: 'settings',
    });
  },

  async addToken(netId, token) {
    try {
      return await proxyRequest.write(`/tokens/${netId}/${token.address}`, {
        payload: token,
      });
    } catch (error) {
      throw new NotificationError({
        title: 'Token request error',
        text: 'Failed to add user token. Please, try again',
        type: 'is-danger',
      });
    }
  },

  async removeToken(netId, address) {
    try {
      return await proxyRequest.remove(`/tokens/${netId}/${address}`);
    } catch (error) {
      throw new NotificationError({
        title: 'Token request error',
        text: 'Failed to remove user token. Please, try again',
        type: 'is-danger',
      });
    }
  },

  async addNetwork(network) {
    try {
      return await proxyRequest.write(`/networks/${network.url}`, {
        payload: network,
      });
    } catch (error) {
      throw new NotificationError({
        title: 'Network request error',
        text: 'Failed to add user network. Please, try again',
        type: 'is-danger',
      });
    }
  },

  async updateNetwork(oldUrl, newNetwork) {
    try {
      return await proxyRequest.write(`/networks/${oldUrl}`, {
        payload: newNetwork,
      });
    } catch (error) {
      throw new NotificationError({
        title: 'Network request error',
        text: 'Failed to update user network. Please, try again',
        type: 'is-danger',
      });
    }
  },

  async removeNetwork(netUrl) {
    try {
      return await proxyRequest.remove(`/networks/${netUrl}`);
    } catch (error) {
      throw new NotificationError({
        title: 'Network request error',
        text: 'Failed to remove user network. Please, try again',
        type: 'is-danger',
      });
    }
  },

  // Returns addresses of all of the user's accounts
  async getAccounts() {
    const addresses = await proxyRequest.read('/accounts');
    return v3KeystoreValidator.validateAddresses(addresses);
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
      return await proxyRequest.write('/accounts', {
        payload: accounts,
      });
    } catch (error) {
      throw new NotificationError({
        title: 'Error updating accounts',
        text: 'An error occurred updating accounts. Please try again later',
        type: 'is-danger',
      });
    }
  },

  // Returns the encrypted keystore for a single account
  async getAccount(address) {
    try {
      const [account, info] = await Promise.all([
        proxyRequest.read(`/account/${address}`),
        proxyRequest.read(`/account/${address}/info`).catch(() => ({})),
      ]);

      return {
        ...v3KeystoreValidator.validateAccount(account),
        address,
        info,
      };
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
  async getV3Accounts() {
    try {
      const accounts = await this.getAccounts();
      const allAcc = accounts
        .filter(acc => !keystore.isExtendedPublicKey(acc))
        .map(this.getAccount);

      return await Promise.all(allAcc);
    } catch (e) {
      if (e.response && e.response.status === 401) {
        throw e;
      }

      throw new NotificationError({
        title: 'Accounts request error',
        text: 'Failed to get user accounts. Please, reload page',
        type: 'is-danger',
      });
    }
  },

  // Returns the encrypted keystore for the user's HD wallet, if any
  // Right now, uses the first HD address found as a key
  async getHDKey() {
    const accounts = await this.getAccounts();

    const hdAddresses = accounts.filter(acc =>
      keystore.isExtendedPublicKey(acc),
    );

    if (hdAddresses.length === 0) {
      return null;
    }

    const hdAccounts = await Promise.all(
      hdAddresses.map(acc => this.getAccount(acc)),
    );

    const hdAccount =
      hdAccounts.find(
        account => get(account, 'info.type') === WALLET_TYPES.HD_MAIN,
      ) || hdAccounts.find(acc => keystore.isV3(acc));

    return v3KeystoreValidator.validateNonEmptyAccountWithInfo(hdAccount);
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

  async setOtpSettings(secret, code) {
    try {
      const { success, message } = await proxyRequest.write('/settings/otp', {
        payload: { secret, code },
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

  async deleteOtpSettings(code) {
    try {
      const { success, message } = await proxyRequest.remove('/settings/otp', {
        payload: {
          data: { code },
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

  async getPasswortRecoveryIdentifier() {
    try {
      const { success, message } = await proxyRequest.read(
        '/recovery-password',
      );

      if (!success) {
        throw new Error(
          `GET ${ENV.VUE_APP_IDENTITY_API_URL}/recovery-password: ${message}`,
        );
      }

      return identityValidator.validatePasswordRecoveryIdentifier(message);
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error recovering wallet password',
        text:
          'An error occurred while recovering wallet password. Please try again.',
        type: 'is-danger',
      });
    }
  },

  async recoverWalletsPassword({ signature, main, standart }) {
    try {
      const { success, message } = await proxyRequest.write(
        '/recovery-password',
        {
          payload: { signature, main, standart },
        },
      );

      if (!success) {
        throw new Error(
          `POST ${ENV.VUE_APP_IDENTITY_API_URL}/recovery-password: ${message}`,
        );
      }

      return { success };
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error recovering wallet password',
        text:
          'An error occurred while recovering wallet password. Please try again.',
        type: 'is-danger',
      });
    }
  },

  async backupSeed(encryptedSeed) {
    try {
      const res = await proxyRequest.write('/user/seed', {
        payload: {
          seed: encryptedSeed,
        },
      });

      return res;
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error backuping seed',
        text:
          'An error occurred during account seed backuping. Please try again.',
        type: 'is-danger',
      });
    }
  },

  async recoverSeed() {
    try {
      const { seed } = await proxyRequest.read('/user/seed');

      return seed;
    } catch (e) {
      throw new NotificationError({
        message: e.message,
        title: 'Error recovering seed backup',
        text: e.message.includes('404')
          ? "You can't restore seed because it was not backuped."
          : 'An error occurred while recovering account seed. Please try again.',
        type: 'is-danger',
      });
    }
  },

  async updateEmail(payload) {
    try {
      const { success, message } = await proxyRequest.write('/user/email', {
        payload,
      });
      if (!success) {
        throw new Error(
          `POST ${ENV.VUE_APP_IDENTITY_API_URL}/user/email: ${message}`,
        );
      }

      return { success };
    } catch (e) {
      throw new NotificationError({
        log: true,
        message: e.message,
        title: 'Error updating email',
        text: 'An error occurred while updating email. Please try again.',
        type: 'is-danger',
      });
    }
  },
};
