import {
  ethplorerHistory,
  ethplorerTransactions,
} from '../fixtures/transactions';

describe('Transactions History Page', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Transactions history items rendering', () => {
    it('should request and render transactions history', () => {
      cy.route({
        method: 'GET',
        url: '/getAddressTransactions/*',
        response: ethplorerTransactions,
        status: 200,
      }).as('addressTransactionsRequest');
      cy.route({
        method: 'GET',
        url: '/getAddressHistory/*',
        response: {
          operations: ethplorerHistory,
        },
        status: 200,
      }).as('addressHistoryRequest');

      cy.visit('#/history');
      cy.waitPageLoad();
      cy.wait(['@addressHistoryRequest', '@addressTransactionsRequest'], {
        timeout: 25000,
      });

      cy.get('[data-test=transactions-history-item]')
        .its('length')
        .should('eq', 4);
    });

    it('should add items to history after transactions send', () => {
      cy.visit('#/history');
      cy.waitPageLoad();

      cy.window()
        .its('app.$store')
        .invoke(
          'commit',
          'transactions/ADD_TRANSACTION',
          ethplorerTransactions[0],
        );

      cy.get('[data-test=transactions-history-item]')
        .its('length')
        .should('eq', 1);
    });
  });

  describe('Transactions history actions', () => {
    beforeEach(() => {
      cy.visit('#/history');
      cy.makeStoreAlias();
      cy.waitPageLoad();

      cy.get('@store').invoke('commit', 'transactions/ADD_TRANSACTION', {
        ...ethplorerTransactions[0],
        state: 'pending',
        clone() {
          return {
            ...this,
          };
        },
        getUpGasPrice: () => 0,
      });
    });

    it('should send requests to cancel transaction', () => {
      cy.get('[data-test=transactions-history-item]').within(() => {
        cy.get('[data-test=transaction-cancel-button]').click();
      });

      cy.get('@store').then(store => {
        cy.spy(store, 'dispatch').as('dispatch');
        cy.stub(store.state.accounts.wallet, 'validatePassword', () => true);
      });

      cy.get('[data-test=password-modal]').within(() => {
        cy.get('input[type=password]').type('12341234');
        cy.get('[data-test=submit-password]').click();
      });

      cy.get('@dispatch').should(
        'be.calledWith',
        'transactions/cancelTransaction',
      );
    });

    it('should send requests to resend transaction', () => {
      cy.get('[data-test=transactions-history-item]').within(() => {
        cy.get('[data-test=transaction-resend-button]').click();
      });
      cy.get('[data-test=resend-modal]').within(() => {
        cy.get('[data-test=gas-price-input]').type('1');
        cy.get('[data-test=submit-button]').click();
      });
      cy.get('[data-test=resend-modal]').should('not.visible');

      cy.get('@store').then(store => {
        cy.spy(store, 'dispatch').as('dispatch');
        cy.stub(store.state.accounts.wallet, 'validatePassword', () => true);
      });

      cy.get('[data-test=password-modal]').within(() => {
        cy.get('input[type=password]').type('12341234');
        cy.get('[data-test=submit-password]').click();
      });

      cy.get('@dispatch').should(
        'be.calledWith',
        'transactions/resendTransaction',
      );
    });
  });

  describe('Incoming transactions', () => {
    beforeEach(() => {
      cy.visit('#/history');
      cy.makeStoreAlias();
      cy.waitPageLoad();
    });

    it('should show notification and add to history', () => {
      cy.get('@store').invoke(
        'dispatch',
        'transactions/handleBlockTransactions',
        {
          transactions: [ethplorerTransactions[0]],
          networkId: 1,
        },
      );

      cy.get('.notification').should('not.exist');
      cy.get('[data-test=transactions-history-item]').should('not.exist');

      cy.get('@store').invoke(
        'dispatch',
        'transactions/handleBlockTransactions',
        {
          transactions: ethplorerTransactions,
          networkId: 3,
        },
      );

      cy.get('.notification.is-info').contains('Incoming transaction');
      cy.get('[data-test=transactions-history-item]').should('not.exist');

      cy.get('@store').invoke(
        'dispatch',
        'transactions/handleBlockTransactions',
        {
          transactions: ethplorerTransactions,
          networkId: 1,
        },
      );

      cy.get('.notification.is-info').should('have.length', 2);
      cy.get('[data-test=transactions-history-item]')
        .should('have.length', 1)
        .and('be.visible');
      cy.get(
        '[data-test=transactions-history-item] [data-test="account-address"]',
      ).then(transactionHeader => {
        const address = transactionHeader.text().toUpperCase();
        const expected = ethplorerTransactions[1].from.toUpperCase();

        cy.wrap(address).should('to.contain', expected);
      });
    });
  });

  describe('Transactions history forms validation', () => {
    beforeEach(() => {
      cy.visit('#/history');
      cy.waitPageLoad();
      cy.makeStoreAlias();
    });

    it('should validate resend transaction form parameters', () => {
      cy.get('@store').invoke('commit', 'transactions/ADD_TRANSACTION', {
        ...ethplorerTransactions[0],
        state: 'pending',
        clone() {
          return {
            ...this,
          };
        },
        getUpGasPrice: () => 0,
      });

      cy.get('[data-test=transactions-history-item]').within(() => {
        cy.get('[data-test=transaction-resend-button]').click();
      });
      cy.get('[data-test=resend-modal]').within(() => {
        cy.get('[data-test=gas-price-input]')
          .clear()
          .type('0');
        cy.get('[data-test=submit-button]').click();
      });
      cy.get('[data-test=password-modal]').should('not.exist');
      cy.get('.notification.is-warning .notification-content').contains(
        'Please correct errors.',
      );
    });
  });
});
