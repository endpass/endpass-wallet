import { transactionToSend } from '../fixtures/transactions';
import { tokens } from '../fixtures/tokeninfo';
import { cryptodataAPIUrl } from '../support/commands/config';

describe('Send Transactions Page', () => {
  describe('the user is not authorized', () => {
    it('should redirect to root', () => {
      cy.preventLogin();
      cy.visit('#/send');
      cy.mockWeb3Requests();
      cy.url().should('include', '/#/?redirect_uri=%2Fsend');
    });
  });

  describe('the user is authorized', () => {
    beforeEach(() => {
      cy.mockInitialData();
      cy.mockPositiveBalance();
      cy.visit('#/send');
      cy.mockWeb3Requests();
      cy.waitPageLoad();
      cy.wait('@mockPositiveBalance');
    });

    it('should validate form', () => {
      cy.get('[data-test=transaction-send-form]').within(() => {
        // Address validation
        cy.get('[data-test=transaction-address-select]')
          .click()
          .within(() => {
            cy.get('.multiselect__input').type('invalid address');
            cy.contains('This is not a valid address');
          });

        // Amount validation
        cy.get('[data-test=transaction-amount-group-field]').within(() => {
          cy.get('[data-test=transaction-amount-input]').should('be.disabled');
        });

        cy.get('[data-test=transaction-advanced-options-button]').click();

        cy.get('[data-test=transaction-advanced-options]').within(() => {
          // Gas price validation
          cy.get('[data-test=transaction-gas-price-input]').clear();
          cy.contains('The gasPrice field is required');

          cy.get('[data-test=transaction-gas-price-input]').type(-1);
          cy.contains('The gasPrice field may only contain numeric characters');

          cy.get('[data-test=transaction-gas-price-input]')
            .clear()
            .type(0);
          cy.contains('The gasPrice field must be between 1 and 100');

          cy.get('[data-test=transaction-gas-price-input]')
            .clear()
            .type(200);
          cy.contains('The gasPrice field must be between 1 and 100');

          // Gas limit validation
          cy.get('[data-test=transaction-gas-limit-input]').clear();
          cy.contains('The gasLimit field is required');

          cy.get('[data-test=transaction-gas-limit-input]').type(-1);
          cy.contains('The gasLimit field may only contain numeric characters');

          cy.get('[data-test=transaction-gas-limit-input]')
            .clear()
            .type(0);
          cy.contains('The gasLimit field must be between 21000 and 1000000');

          cy.get('[data-test=transaction-gas-limit-input]')
            .clear()
            .type(4000001);
          cy.contains('The gasLimit field must be between 21000 and 1000000');

          // Nonce validation
          cy.get('[data-test=transaction-nonce-input]').clear();
          cy.contains('The nonce field is required');

          cy.get('[data-test=transaction-nonce-input]').type(-1);
          cy.contains('The nonce field may only contain numeric characters');

          // Data validation
          cy.get('[data-test=transaction-data-input]').clear();
          cy.contains('The data field is required');

          cy.get('[data-test=transaction-data-input]').type('data');
          cy.contains('This is not a valid hex');
        });

        cy.get('[data-test=transaction-send-button]').should('be.disabled');
      });
    });

    it('should send transaction', () => {
      cy.makeStoreAlias();

      cy.getBalanceTokenElement().contains('2');

      cy.get('[data-test=transaction-send-form]').within(() => {
        cy.get('[data-test=transaction-address-select]')
          .click()
          .within(() => {
            cy.get('.multiselect__input')
              .type(transactionToSend.to)
              .blur();
          });

        cy.get('[data-test=transaction-amount-input]')
          .clear()
          .type(transactionToSend.value);

        cy.get('[data-test=transaction-send-button]').click();
      });

      cy.get('[data-test=transaction-modal]').within(() => {
        cy.get('[data-test=confirm-button]').click();
      });

      cy.route({
        method: 'GET',
        url: `${cryptodataAPIUrl}/*/balance/**`,
        response: {
          balance: '999900000000000000',
          tokens,
        },
      }).as('accountBalanceOnce');

      cy.inputPassword();

      cy.get('@store').then(store => {
        store.dispatch('accounts/updateBalance');
      });

      cy.wait('@accountBalanceOnce');

      cy.getBalanceTokenElement().contains('0.9999');

      cy.get('.app-notification.is-info').contains(
        'Transaction 0x63...42a7 sent',
      );

      cy.get('[data-test=transaction-status]').should('be.visible');
    });
  });
});
