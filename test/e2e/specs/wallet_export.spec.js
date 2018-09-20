import { privateKey } from '../fixtures/wallet';

describe('Export wallet page', () => {
  beforeEach(() => {
    cy.server();
    cy.login();
  });

  describe('Export private key', () => {
    it('should show private key with valid password', () => {
      cy.visit('#/export');
      cy.window()
        .its('app.$store')
        .as('store');

      cy.get('[data-test=export-private-key-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.get('@store').then(store => {
        cy.stub(
          store.state.accounts.wallet,
          'getPrivateKeyString',
          () => privateKey,
        );
      });
      cy.enterValidPassword();
      cy.get('[data-test=password-modal]').should('not.visible');
      cy.get('[data-test=private-key-code]').contains(privateKey);
      cy.get('[data-test=hide-button]').click();
      cy.get('[data-test=private-key-code]').should('not.visible');
    });

    it('should not show private key with invalid password', () => {
      cy.visit('#/export');
      cy.window()
        .its('app.$store')
        .as('store');

      cy.get('[data-test=export-private-key-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.enterInvalidPassword();
      cy.get('[data-test=password-modal]').should('exist');
      cy.get('[data-test=private-key-code]').should('not.exist');
    });
  });

  describe('Export to JSON', () => {
    it('should export JSON data with valid password', () => {
      cy.visit('#/export');
      cy.window()
        .its('app.$store')
        .as('store');

      cy.get('[data-test=export-json-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.get('@store').then(store => {
        cy.spy(store.state.accounts.wallet, 'exportToJSON').as('exportToJSON');
      });
      cy.enterValidPassword();
      cy.get('[data-test=password-modal]').should('not.visible');
      cy.get('@exportToJSON').should('be.called');
    });

    it('should not export JSON data with invalid password', () => {
      cy.visit('#/export');
      cy.window()
        .its('app.$store')
        .as('store');

      cy.get('[data-test=export-json-button]').click();
      cy.get('[data-test=export-button]').click();
      cy.get('@store').then(store => {
        cy.spy(store.state.accounts.wallet, 'exportToJSON').as('exportToJSON');
      });
      cy.enterInvalidPassword();
      cy.get('[data-test=password-modal]');
      cy.get('@exportToJSON').should('not.be.called');
    });
  });
});
