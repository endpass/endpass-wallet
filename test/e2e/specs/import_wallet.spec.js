import {
  checksumAddress,
  v3password,
  privateKey,
  mnemonic,
} from '../fixtures/accounts';

describe('Import Wallet Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    cy.visit('#/import');
    cy.waitPageLoad();
  });

  it('should import wallet from private key', () => {
    cy.contains('Private Key').click();
    cy.get('[data-test=input-private-key]').type(privateKey);
    cy.get('[data-test=submit-import]').click();
    cy.inputPassword();
    cy.get('[data-test=address-card]', {
      timeout: 15000,
    })
      .contains(checksumAddress)
      .should('exist');
    cy.get('[data-test=nav-sidebar-menu]')
      .contains('Send')
      .should('exist');
  });

  it('should import wallet from public key', () => {
    cy.contains('Address').click();
    cy.get('[data-test=input-public-key]').type(checksumAddress);
    cy.get('[data-test=submit-import]').click();
    cy.get('[data-test=address-card]', {
      timeout: 15000,
    })
      .contains(checksumAddress)
      .should('exist');
    cy.get('[data-test=nav-sidebar-menu]')
      .contains('Send')
      .should('not.exist');
    cy.get('[data-test=nav-sidebar-menu]')
      .contains('Tools')
      .should('not.exist');
  });

  it('should import wallet from seed phrase', () => {
    cy.contains('Seed Phrase').click();
    cy.get('[data-test=input-seed-phrase]').type(mnemonic);
    cy.get('[data-test=submit-import]').click();
    cy.inputPassword();
    cy.get('[data-test=address-card]', {
      timeout: 15000,
    })
      .contains(checksumAddress)
      .should('exist');
    cy.get('[data-test=nav-sidebar-menu]')
      .contains('Send')
      .should('exist');
  });

  it('should import wallet from json file', () => {
    cy.contains('V3 JSON').click();
    cy.uploadFile(
      '[data-test=input-file]',
      'keystore/account_import.json',
      'application/json',
    );
    cy.get('[data-test=input-json-file-password]').type(v3password);
    cy.get('[data-test=submit-import]').click();
    cy.inputPassword();
    cy.get('[data-test=address-card]', {
      timeout: 15000,
    })
      .contains(checksumAddress)
      .should('exist');
    cy.get('[data-test=nav-sidebar-menu]')
      .contains('Send')
      .should('exist');
  });

  it('should validate import form', () => {
    // Wrong password
    const badPassword = v3password.slice(0, 4);

    // Wrong file
    cy.contains('V3 JSON').click();

    // Without file
    cy.get('[data-test=input-json-file-password]').type(v3password);
    cy.get('[data-test=submit-import]').should('be.disabled');

    // With bad file
    cy.uploadFile(
      '[data-test=input-file]',
      'keystore/accounts.json',
      'application/json',
    );
    cy.get('[data-test=import-json-form]')
      .contains('File is invalid')
      .and('be.visible');

    // With bad json password
    cy.get('[data-test=input-json-file-password]')
      .clear()
      .type(badPassword);
    cy.get('[data-test=import-json-form] p:contains(least 8 characters)')
      .should('have.length', 1)
      .and('be.visible');

    // Import button disabled
    cy.get('[data-test=submit-import]').should('be.disabled');

    // Wrong seed phrase
    cy.contains('Seed Phrase').click();

    cy.get('[data-test=input-seed-phrase]').type(mnemonic.slice(0, 20));

    cy.get('[data-test=import-seed-form]')
      .contains('not a valid seed')
      .and('be.visible');

    // Import button disabled
    cy.get('[data-test=submit-import]').should('be.disabled');

    // Wrong private key
    cy.contains('Private Key').click();

    cy.get('[data-test=input-private-key]').type(privateKey.slice(0, 10));

    cy.get('[data-test=import-private-form]')
      .contains('not a valid private key')
      .and('be.visible');

    // Import button disabled
    cy.get('[data-test=submit-import]').should('be.disabled');

    // Wrong public key
    cy.contains('Address').click();

    cy.get('[data-test=input-public-key]').type(checksumAddress.slice(0, 10));

    cy.get('[data-test=import-public-form]')
      .contains('not a valid address')
      .and('be.visible');

    // Import button disabled
    cy.get('[data-test=submit-import]').should('be.disabled');
  });
});
