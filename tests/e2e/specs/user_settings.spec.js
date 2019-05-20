import { v3password } from '../fixtures/accounts';
import user from '../fixtures/identity/user';
import seed from '../fixtures/identity/seed';
import recoveredSeed from '../fixtures/identity/recovered_seed';

describe('Settings Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    cy.visit('#/settings');
    cy.mockWeb3Requests();
    cy.waitPageLoad();
  });

  it('should save user settings', () => {
    cy.get('[data-test=input-email]').should('have.value', user.email);
    cy.get('[data-test=select-fiat]').should('contain', user.fiatCurrency);

    // Change fiat currency
    cy.get('[data-test=select-fiat] select')
      .select('AUD')
      .should('have.value', 'AUD');
    cy.contains('Settings Saved').should('be.visible');
  });

  it('should save otp settings', () => {
    // Enable otp
    cy.get('[data-test=button-two-factor]').click();
    cy.focused().should('have.attr', 'data-test', 'input-two-auth-code');
    cy.get('[data-test=input-two-auth-code]').type('1234');
    cy.get('[data-test=input-two-auth-code]')
      .parentsUntil('form')
      .should('contain', 'contain 6 digits');
    cy.get('[data-test=submit-two-auth-modal]').should('be.disabled');
    cy.get('[data-test=input-two-auth-code]').type('56');
    cy.get('[data-test=submit-two-auth-modal]').click();
    cy.get('[data-test=button-two-factor]').should('contain', 'Disable');
    cy.get(
      '[data-test=app-notification] .is-info .notification-content',
    ).contains('Your settings have been saved.');
    // Disable otp
    cy.get('[data-test=button-two-factor]').click();
    cy.get('[data-test=input-two-auth-code]').type('123456{enter}');
    cy.get('[data-test=button-two-factor]').should('contain', 'Enable');
    cy.get(
      '[data-test=app-notification] .is-info .notification-content',
    ).contains('Your settings have been saved.');
  });

  it('should change the password', () => {
    // Change password
    cy.get('[data-test=input-old-password]').type(v3password);
    cy.get('[data-test=input-new-password]').type('22222222');
    cy.get('[data-test=submit-change-password]').click();
    cy.contains('Password changed successfully').should('be.visible');

    // Validate password
    cy.get('[data-test=input-old-password]').type(v3password);
    cy.get('[data-test=input-new-password]').type('2222');
    cy.get('[data-test=input-new-password]')
      .parentsUntil('form')
      .should('contain', 'least 8 characters');
    cy.get('[data-test=submit-change-password]').should('be.disabled');
    cy.get('[data-test=input-new-password]').type('2222');
    cy.get('[data-test=submit-change-password]').click();
    cy.contains(
      'You entered incorrect password, try using a different one.',
    ).should('be.visible');
  });

  describe('seed restoration', () => {
    it('should restore seed with wallet password', () => {
      cy.route({
        method: 'GET',
        url: 'https://identity-dev.endpass.com/api/v1.1/user/seed',
        status: 200,
        response: seed,
      }).as('userSeed');
      cy.get('[data-test=recover-seed-button]').click();
      cy.get('[data-test=password-modal]').within(() => {
        cy.inputPassword();
      });
      cy.wait('@userSeed');
      cy.get('[data-test=password-modal]').should('not.be.visible');
      cy.get('[data-test=info-modal]').within(() => {
        cy.get('[data-test=recovered-seed-phrase]').contains(
          recoveredSeed.seed,
        );
      });
    });

    it('should lock seed restoration if it is not available', () => {
      cy.route({
        method: 'GET',
        url: 'https://identity-dev.endpass.com/api/v1.1/user/seed',
        status: 404,
        response: {},
      }).as('userSeed');
      cy.get('[data-test=recover-seed-button]').click();
      cy.get('[data-test=password-modal]').within(() => {
        cy.inputPassword();
      });
      cy.wait('@userSeed');
      cy.get('[data-test=password-modal]').should('not.be.visible');
      cy.get('[data-test=info-modal]').should('not.be.visible');
      cy.get('[data-test=recover-seed-button]').should('be.disabled');
      cy.contains("You can't restore seed because it was not backuped.");
    });
  });
});
