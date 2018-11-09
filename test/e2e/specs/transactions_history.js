import { blockTransactions, transactionToSend } from '../fixtures/transactions';

describe('Transactions History Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    cy.visit('#/history');
    cy.mockWeb3Requests();
    cy.makeStoreAlias();
    cy.waitPageLoad();
  });

  describe('Transactions history items rendering', () => {
    it('should request and render transactions history', () => {
      cy.wait(['@addressHistoryRequest', '@addressTransactionsRequest'], {
        timeout: 25000,
      });

      cy.get('[data-test=transactions-history-item]')
        .its('length')
        .should('eq', 4);
    });

    it('should add items to history after transactions send', () => {
      cy.get('@store').invoke(
        'commit',
        'transactions/ADD_TRANSACTION',
        transactionToSend,
      );

      cy.get('[data-test=transactions-history-item]')
        .its('length')
        .should('eq', 1);
    });
  });

  describe('Transactions history actions', () => {
    beforeEach(() => {
      cy.get('@store').invoke('commit', 'transactions/ADD_TRANSACTION', {
        ...transactionToSend,
        state: 'pending',
      });
    });

    it('should send requests to cancel transaction', () => {
      cy.get('[data-test=transactions-history-item]').within(() => {
        cy.get('[data-test=transaction-cancel-button]').click();
      });

      cy.inputPassword();

      cy.get('[data-test=app-notification] .is-info').contains(
        'Transaction was canceled',
      );
    });

    it('should send requests to resend transaction', () => {
      cy.get('[data-test=transactions-history-item]').within(() => {
        cy.get('[data-test=transaction-resend-button]').click();
      });
      cy.get('[data-test=resend-modal]').within(() => {
        cy.focused().should('have.attr', 'data-test', 'gas-price-input');
        cy.get('[data-test=gas-price-input]')
          .clear()
          .type(transactionToSend.gasPrice);
        cy.get('[data-test=submit-button]').click();
      });
      cy.get('[data-test=resend-modal]').should('not.visible');

      cy.inputPassword();

      cy.get('[data-test=app-notification] .is-info').contains(
        'Transaction was resent',
      );
    });
  });

  describe('Incoming transactions', () => {
    it('should show notification and add to history', () => {
      cy.get('@store').invoke(
        'dispatch',
        'transactions/handleBlockTransactions',
        {
          transactions: [blockTransactions[0]],
        },
      );

      cy.get('.notification').should('not.exist');
      cy.get('[data-test=transactions-history-item]').should('not.exist');

      cy.get('@store').invoke(
        'dispatch',
        'transactions/handleBlockTransactions',
        {
          transactions: [blockTransactions[1]],
        },
      );

      cy.get('.notification.is-info').contains('Incoming transaction');
      cy.get('[data-test=transactions-history-item]').should('not.exist');

      cy.get('@store').invoke(
        'dispatch',
        'transactions/handleBlockTransactions',
        {
          transactions: [blockTransactions[2]],
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
        const expected = blockTransactions[2].from.toUpperCase();

        cy.wrap(address).should('to.contain', expected);
      });
    });
  });

  describe('Transactions history forms validation', () => {
    it('should validate resend transaction form parameters', () => {
      cy.get('@store').invoke('commit', 'transactions/ADD_TRANSACTION', {
        ...transactionToSend,
        state: 'pending',
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
