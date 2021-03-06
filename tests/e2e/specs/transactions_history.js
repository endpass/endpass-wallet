import { blockTransactions, transactionToSend } from '@fixtures/transactions';

const historyTransaction = Object.freeze({
  ...transactionToSend,
  state: 'pending',
  hash: '0x24802a752fbd9e7a71484fbef5e5c6cc6180031817b6ad3254874fce596c1af0',
});

describe('Transactions History Page', () => {
  describe('Render list from transaction history', () => {
    beforeEach(() => {
      cy.mockInitialData();
      cy.mockTransactionHistory();
      cy.visit('#/history');
      cy.waitPageLoad();

      cy.wait(['@tokenTransactionsHistory', '@addressTransactionsHistory'], {
        timeout: 25000,
      });
    });

    describe('Transactions history items rendering', () => {
      it('should request and render transactions history', () => {
        cy.get('[data-test=transactions-history-item]')
          .its('length')
          .should('eq', 2);
      });

      it('should add items to history after transactions send', () => {
        cy.get('@store').invoke(
          'commit',
          'transactions/ADD_TRANSACTION',
          historyTransaction,
        );

        cy.wait(100);

        cy.get('[data-test=transactions-history-item]')
          .its('length')
          .should('eq', 3);
      });
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      cy.mockInitialData();
      cy.visit('#/history');
      cy.waitPageLoad();

      cy.wait(['@tokenTransactionsHistory', '@addressTransactionsHistory'], {
        timeout: 25000,
      });
    });

    describe('Transactions history actions', () => {
      beforeEach(() => {
        cy.get('@store').invoke(
          'commit',
          'transactions/ADD_TRANSACTION',
          historyTransaction,
        );

        cy.wait(100);
      });

      it('should send requests to cancel transaction', () => {
        cy.get('[data-test=transactions-history-item]').within(() => {
          cy.get('[data-test=transaction-cancel-button]').click();
        });

        cy.inputPassword();

        cy.get('[data-test=transaction-details-button]:first').click();

        cy.get('[data-test=transaction-details] .status-text')
          .contains('canceled')
          .should('be.visible');

        cy.get('.app-notification.is-info')
          .contains('Transaction was canceled')
          .should('be.visible');
      });

      it('should send requests to resend transaction', () => {
        cy.get('[data-test=transactions-history-item]').within(() => {
          cy.get('[data-test=transaction-resend-button]').click();
        });
        cy.get('[data-test=resend-modal]').within(() => {
          cy.focused().should('have.attr', 'data-test', 'gas-price-input');
          cy.get('[data-test=submit-button]').click();
        });
        cy.get('[data-test=resend-modal]').should('not.visible');

        cy.inputPassword();

        cy.get('.app-notification.is-info')
          .contains('Transaction was resent')
          .should('be.visible');
      });

      it('should change state of transaction from pending to success', () => {
        cy.get('[data-test=transaction-details-button]').click();

        cy.get('[data-test=transaction-details] .status-text')
          .contains('pending')
          .should('be.visible');

        cy.get('@store').invoke('commit', 'transactions/UPDATE_TRANSACTION', {
          hash: historyTransaction.hash,
          payload: {
            state: 'success',
          },
        });

        cy.get('[data-test=transaction-details] .status-text')
          .contains('success')
          .should('be.visible');
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

        cy.get('.app-notification').should('not.exist');
        cy.get('[data-test=transactions-history-item]').should('not.exist');

        cy.get('@store').invoke(
          'dispatch',
          'transactions/handleBlockTransactions',
          {
            transactions: [blockTransactions[1]],
          },
        );

        cy.get('.app-notification.is-info').contains('Incoming transaction');
        cy.get('[data-test=transactions-history-item]').should('not.exist');

        cy.get('@store').invoke(
          'dispatch',
          'transactions/handleBlockTransactions',
          {
            transactions: [blockTransactions[2]],
          },
        );

        cy.get('.app-notification.is-info').should('have.length', 2);
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
        cy.get('@store').invoke(
          'commit',
          'transactions/ADD_TRANSACTION',
          historyTransaction,
        );

        cy.get('[data-test=transactions-history-item]').within(() => {
          cy.get('[data-test=transaction-resend-button]').click();
        });
        cy.get('[data-test=resend-modal]').within(() => {
          cy.get('[data-test=gas-price-input]')
            .clear()
            .type('0');
          cy.get('[data-test=submit-button]').should('be.disabled');
        });
      });
    });
  });
});
