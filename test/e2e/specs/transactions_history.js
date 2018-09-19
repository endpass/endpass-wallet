import {
  ethplorerHistory,
  ethplorerTransactions,
} from '../fixtures/transactions';

describe('Transactions History Page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should request and render transactions history', () => {
    cy.server();
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
    cy.wait(['@addressHistoryRequest', '@addressTransactionsRequest'], {
      timeout: 10000,
    });

    cy.get('[data-test=transactions-history-item]')
      .its('length')
      .should('eq', 4);
  });

  it('should add items to history after transactions send', () => {
    cy.visit('#/history');

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

  describe('Transactions history actions', () => {
    beforeEach(() => {
      cy.visit('#/history');
      cy.window()
        .its('app.$store')
        .as('store');

      cy.get('@store').invoke('commit', 'transactions/ADD_TRANSACTION', {
        ...ethplorerTransactions[0],
        state: 'pending',
        clone() {
          return {
            ...this,
          };
        },
        getUpGasPrice() {
          return 0;
        },
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

      cy.get('[data-test=password-modal]')
        .within(() => {
          cy.get('input[type=password]').type('12341234');
          cy.get('[data-test=submit-password]').click();
        })
        .as('login');

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
        cy.get('[data-test=gas-limit-input]').type('1');
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
});
