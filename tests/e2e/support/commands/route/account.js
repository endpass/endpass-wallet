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
import { identityAPIUrl } from '@config';
import { hdv3, hdv3Info } from '@fixtures/accounts';

// Sets up server and routes to stub logged in user with fixtures.

Cypress.Commands.add('mockAccountsDataFailed', () => {
  cy.route({
    url: `${identityAPIUrl}/accounts`,
    response: {},
    status: 401,
  }).as('keystoreAccountsNotLogin');

  cy.route({
    url: `${identityAPIUrl}/settings`,
    response: {},
    status: 401,
  }).as('userSettingsNotLogin');

  cy.route({
    url: `${identityAPIUrl}/auth/check`,
    response: {},
    status: 401,
  }).as('authCheckFail');
});

Cypress.Commands.add('mockAccountKeystores', () => {
  // Keystore server
  cy.route('GET', `${identityAPIUrl}/info`, 'fixture:keystore/info.json').as(
    'keystoreServerInfo',
  );

  // Accounts list
  cy.route(
    'GET',
    `${identityAPIUrl}/accounts`,
    'fixture:keystore/accounts.json',
  ).as('keystoreAccounts');

  // All account info
  cy.route('GET', /\/account\/(\w+)\/info$/, {}).as('accountInfo');

  // Regular account
  cy.route(
    'GET',
    `${identityAPIUrl}/account/0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c`,
    'fixture:keystore/account_1.json',
  ).as('keystoreAccount');

  // HD account
  cy.route(
    'GET',
    `${identityAPIUrl}/account/xpub*`,
    'fixture:keystore/account_0.json',
  ).as('keystoreHdAccount');
  cy.route(
    'POST',
    `${identityAPIUrl}/account/*/info`,
    'fixture:identity/success.json',
  ).as('saveKeystoreHdAccountInfo');
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
  cy.route(
    'POST',
    `${identityAPIUrl}/account/*`,
    'fixture:identity/success.json',
  ).as('keystoreAddAccount');
  cy.route(
    'POST',
    `${identityAPIUrl}/accounts`,
    'fixture:identity/success.json',
  ).as('keystoreUpdateAccounts');
});
