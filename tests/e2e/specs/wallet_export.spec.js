import { privateKey } from '@fixtures/accounts';

describe('Export wallet page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('#/export');
    cy.waitPageLoad();
  });

  describe('Export private key', () => {
    it('should show private key with valid password', () => {
      cy.get('[data-test=export-private-key-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.focused().should('have.attr', 'data-test', 'input-password');
      cy.inputPassword();
      cy.get('[data-test=password-modal]').should('not.exist');
      cy.get('[data-test=private-key-code]').contains(privateKey);
      cy.get('[data-test=hide-button]').click();
      cy.get('[data-test=private-key-code]').should('not.exist');
    });

    it('should not show private key with invalid password', () => {
      cy.get('[data-test=export-private-key-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.inputInvalidPassword();
      cy.get('[data-test=password-modal]').should('exist');
      cy.get('[data-test=private-key-code]').should('not.exist');
    });
  });

  describe('Export to JSON', () => {
    beforeEach(() => {
      cy.get('@store').then(store => {
        cy.stub(
          store.getters['accounts/wallet'],
          'exportToJSON',
          () => null,
        ).as('exportToJSON');
      });
    });

    it('should export JSON data with valid password', () => {
      cy.get('[data-test=export-json-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.inputPassword();
      cy.get('[data-test=password-modal]').should('not.exist');
      cy.get('@exportToJSON').should('be.called');
    });

    it('should not export JSON data with invalid password', () => {
      cy.get('[data-test=export-json-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.inputInvalidPassword();
      cy.get('[data-test=password-modal]').should('be.exist');
      cy.get('@exportToJSON').should('not.be.called');
    });
  });
});
