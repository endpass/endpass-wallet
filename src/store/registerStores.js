import accounts from './accounts';
import tokens from './tokens';
import web3 from './web3';
import gasPrice from './gas-price';
import transactions from './transactions';
import user from './user';

export default function(store) {
  store.registerModule('accounts', accounts);
  store.registerModule('tokens', tokens);
  store.registerModule('web3', web3);
  store.registerModule('gasPrice', gasPrice);
  store.registerModule('transactions', transactions);
  store.registerModule('user', user);

  if (module.hot) {
    // Enable hot reloading in development
    module.hot.accept(
      [
        './core/mutations',
        './core/actions',
        './accounts',
        './web3',
        './tokens',
        './gas-price',
        './transactions',
        './user',
      ],
      () => {
        /* eslint-disable global-require */
        const newMutations = require('./core/mutations').default;
        const newActions = require('./core/actions').default;
        const newAccounts = require('./accounts').default;
        const newWeb3 = require('./web3').default;
        const newTokens = require('./tokens').default;
        const newGasPrice = require('./gas-price').default;
        const newTransactions = require('./transactions').default;
        const newUserModule = require('./user').default;

        // swap in the new actions and mutations
        store.hotUpdate({
          mutations: newMutations,
          actions: newActions,
          modules: {
            accounts: newAccounts,
            web3: newWeb3,
            tokens: newTokens,
            gasPrice: newGasPrice,
            transactions: newTransactions,
            user: newUserModule,
          },
        });
      },
    );
  }
}
