/* eslint-disable camelcase */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress
// .Commands
// .add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress
// .Commands
// .add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { hdv3, hdv3Info, accountsList, v3, v3Info } from '@fixtures/accounts';
import { successResp, identityServerInfo } from '@fixtures/identity';
import { identityAPIUrl } from '@config';

// Sets up server and routes to stub logged in user with fixtures.

Cypress.Commands.add('mockAccountsList', (status = 200, response = []) => {
  cy.route({
    url: `${identityAPIUrl}/accounts`,
    response,
    status,
  }).as('keystoreAccountsNotLogin');
});

Cypress.Commands.add('mockUserSettings', (status = 200) => {
  cy.route({
    url: `${identityAPIUrl}/settings`,
    response: {},
    status,
  });
});

Cypress.Commands.add('mockAccountKeystores', () => {
  // Keystore server
  cy.route('GET', `${identityAPIUrl}/info`, identityServerInfo).as(
    'keystoreServerInfo',
  );

  // Accounts list
  cy.route('GET', `${identityAPIUrl}/accounts`, accountsList).as(
    'keystoreAccounts',
  );

  // All account info
  cy.route('GET', `${identityAPIUrl}/account/*/info`, {}).as(
    'accountEmptyInfo',
  );

  // Regular account
  cy.route('GET', `${identityAPIUrl}/account/${v3.address}`, v3).as(
    'keystoreAccount',
  );
  cy.route('GET', `${identityAPIUrl}/account/${v3.address}/info`, v3Info).as(
    'keystoreAccountInfo',
  );

  // HD account
  cy.route('GET', `${identityAPIUrl}/account/${hdv3.address}`, hdv3).as(
    'keystoreHdAccountMain',
  );
  cy.route(
    'GET',
    `${identityAPIUrl}/account/${hdv3.address}/info`,
    hdv3Info,
  ).as('keystoreHdAccountMainInfo');

  // Read only account
  cy.route(
    'GET',
    `${identityAPIUrl}/account/0x6bBf1DEa0d21eaFd232e281A196E6f11906054df`,
    {},
  ).as('publicAccount');

  // Account modification
  cy.route('POST', `${identityAPIUrl}/account/*/info`, successResp).as(
    'saveKeystoreAccountInfo',
  );
  cy.route('POST', `${identityAPIUrl}/account/*`, successResp).as(
    'keystoreAddAccount',
  );
  cy.route('POST', `${identityAPIUrl}/accounts`, successResp).as(
    'keystoreUpdateAccounts',
  );
});
