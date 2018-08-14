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
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Sets up server and routes to stub logged in user with fixtures.
// Usage: cy.login()
Cypress.Commands.add('login', () => {
  cy.server();

  // Keystore server
  cy.route('GET', '/identity/api/v1/info', 'fixture:keystore/info.json').as(
    'keystoreInfo',
  );
  cy.route(
    'GET',
    '/identity/api/v1/accounts',
    'fixture:keystore/accounts.json',
  ).as('keystoreAccounts');
  cy.route(
    'GET',
    '/identity/api/v1/account/0x*',
    'fixture:keystore/account_0.json',
  ).as('keystoreAccount');
  cy.route(
    'GET',
    '/identity/api/v1/account/xpub*',
    'fixture:keystore/account_1.json',
  ).as('keystoreHdAccount');
  cy.route(
    'POST',
    '/identity/api/v1/accounts/*',
    'fixture:identity/success.json',
  ).as('keystoreAddAccount');

  // Identity server
  cy.route('GET', '/identity/api/v1/user', 'fixture:identity/user.json').as(
    'identityUser',
  );
  cy.route('POST', '/identity/api/v1/user', 'fixture:identity/success.json').as(
    'identityPostSettings',
  );
  cy.route('GET', '/identity/api/v1/otp', 'fixture:identity/otp.json').as(
    'identityOtp',
  );
  cy.route('POST', '/identity/api/v1/otp', 'fixture:identity/success.json').as(
    'identitySetOtp',
  );
  cy.route(
    'DELETE',
    '/identity/api/v1/otp',
    'fixture:identity/success.json',
  ).as('identityDeleteOtp');
});
