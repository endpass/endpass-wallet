import axios from 'axios';
import { NotificationError } from '@/class';
import accountsFixture from 'fixtures/accounts';

const { addresses, v3, hdv3 } = accountsFixture;

export default {
  login(email) {
    const error = new NotificationError({
      title: 'Auth error',
      text: 'Invalid or missing email address. Please, try again',
      type: 'is-danger',
    });

    return Promise.resolve({
      success: true,
      challenge: {
        challenge_type: 'email_link',
      },
    })
      .then(({ success, challenge }) => {
        if (!success) {
          throw error;
        }

        return challenge.challenge_type;
      })
      .catch(() => {
        throw error;
      });
  },

  logout() {
    return Promise.resolve({ success: true });
  },

  getSettings() {
    return Promise.resolve({
      id: 'abcd-1234',
      email: 'user@example.com',
      net: 3,
      networks: [
        {
          id: 5,
          name: 'asdfa',
          url: 'https://web3.example.com/rpc',
        },
      ],
      settings: {
        currency: 'USD',
      },
      tokens: {
        '3': [
          {
            address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
            decimals: 18,
            logo: '/img/0xe41d2489571d322189246dafa5ebde1f4699f498.png',
            manuallyAdded: true,
            name: '0x Project',
            symbol: 'ZRX',
          },
        ],
      },
    }).catch(() => {
      throw new NotificationError({
        title: 'User request error',
        text: 'Failed to get user information. Please, reload page',
        type: 'is-danger',
      });
    });
  },

  setSetting(settings) {
    return Promise.resolve({
      success: true,
    });
  },

  setSettings(settings) {
    return Promise.resolve({
      success: true,
    });
  },

  removeSettings(propsArr) {
    return Promise.resolve({
      success: true,
    });
  },

  getAccounts() {
    return Promise.resolve(addresses).catch(() => {
      throw new NotificationError({
        title: 'Accounts request error',
        text: 'Failed to get user accounts. Please, reload page',
        type: 'is-danger',
      });
    });
  },

  setAccount(account) {
    return Promise.resolve({
      success: true,
    });
  },

  getAccount(account) {
    let json;
    if (account.slice(0, 4) === 'xpub') {
      //is an extended key
      json = hdv3;
    } else {
      json = v3;
    }
    return Promise.resolve(json).catch(() => {
      const shortAcc = account.replace(/^(.{5}).+/, '$1…');

      throw new NotificationError({
        title: 'Account request error',
        text: `Failed to get account ${shortAcc}. Please, reload page`,
        type: 'is-danger',
      });
    });
  },

  getV3Accounts() {
    return Promise.resolve(addresses)
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
};
