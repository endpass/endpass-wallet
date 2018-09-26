import { message, signedMessage, address } from '../fixtures/message';

describe('Message Page', () => {
  describe('the user is not authorized', () => {
    it('should redirect to root', () => {
      cy.preventLogin();
      cy.visit('#/message');
      cy.url().should('include', '/#/?redirect_uri=%2Fmessage');
    });
  });

  describe('the user is authorized', () => {
    beforeEach(() => {
      cy.getInitialData();
      cy.visit('#/message');
      cy.waitPageLoad();
    });

    describe('sign message', () => {
      it('should sign message', () => {
        cy.get('[data-test=sign-message-tab]').click();

        cy.get('[data-test=signing-message-form]').within(() => {
          cy.get('[data-test=sign-button]').should('be.disabled');

          cy.get('[data-test=message-textarea]').type(message);
          cy.get('[data-test=sign-button]').click();
        });

        cy.inputPassword();

        cy.get('[data-test=signed-message-textarea]')
          .invoke('val')
          .should('equal', JSON.stringify(signedMessage));
      });

      it('should redirect to root if a public account is selected', () => {
        cy.switchAccount();
        cy.url().should('equal', Cypress.config().baseUrl + '/#/');
      });
    });

    describe('verify message', () => {
      beforeEach(() => {
        cy.get('[data-test=verify-message-tab]').click();

        cy.get('[data-test=verifying-message-form]').within(() => {
          cy.get('[data-test=signed-message-textarea]').clear();
          cy.get('[data-test=verify-button]').should('be.disabled');
        });
      });

      it('should verify message', () => {
        const signedMessageString = JSON.stringify(signedMessage).replace(
          '{',
          '{{}',
        );

        cy.get('[data-test=verifying-message-form]').within(() => {
          cy.get('[data-test=signed-message-textarea]').type(
            signedMessageString,
          );
          cy.get('[data-test=verify-button]').click();

          cy.get('[data-test=address-field]').contains(address);
        });
      });

      it('should not verify message', () => {
        cy.get('[data-test=verifying-message-form]').within(() => {
          cy.get('[data-test=signed-message-textarea]').type('text');
          cy.get('[data-test=verify-button]').should('be.disabled');

          cy.get('[data-test=signed-message-textarea]')
            .clear()
            .type('{{}}');
          cy.get('[data-test=verify-button]').click();

          cy.get('[data-test=address-field]').should('not.to.exist');
        });
      });
    });
  });
});
