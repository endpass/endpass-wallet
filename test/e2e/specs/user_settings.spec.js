import {
  checksumAddress,
  v3password,
  privateKey,
  mnemonic,
} from '../fixtures/accounts';
import user from '../fixtures/identity/user';

describe('Settings Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    cy.visit('#/settings');
    cy.waitPageLoad();
  });

  it('should save user settings', () => {
    cy.get('[data-test=input-email]').should('have.value', user.email);
    cy.get('[data-test=select-fiat]').should('contain', user.settings.currency);

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
    cy.contains('Error while decrypting wallets').should('be.visible');
  });
});
