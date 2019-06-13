/* eslint-disable camelcase */
// Usage: cy.login()
import { hdv3, hdv3Info } from '../../fixtures/accounts';
import seed from '../../fixtures/identity/seed';
import { identityAPIUrl } from './config';

Cypress.Commands.add('login', () => {
  cy.server();

  // Keystore server
  cy.route('GET', `${identityAPIUrl}/info`, 'fixture:keystore/info.json').as(
    'keystoreInfo',
  );
  cy.route(
    'GET',
    `${identityAPIUrl}/accounts`,
    'fixture:keystore/accounts.json',
  ).as('keystoreAccounts');
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
    `${identityAPIUrl}/account/xpub*/info`,
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
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/user/seed`,
    status: 200,
    response: seed,
  }).as('userSeed');
  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/user/seed`,
    status: 200,
    response: { success: true },
  }).as('saveUserSeed');

  // Read only account
  cy.route(
    'GET',
    `${identityAPIUrl}/account/0x6bBf1DEa0d21eaFd232e281A196E6f11906054df`,
    {},
  ).as('publicAccount');
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

  // Identity server
  cy.route(
    'GET',
    `${identityAPIUrl}/settings`,
    'fixture:identity/user.json',
  ).as('identityUser');
  cy.route(
    'POST',
    `${identityAPIUrl}/settings`,
    'fixture:identity/success.json',
  ).as('identityPostSettings');
  cy.route(
    'GET',
    `${identityAPIUrl}/settings/otp`,
    'fixture:identity/otp.json',
  ).as('identityOtp');
  cy.route(
    'POST',
    `${identityAPIUrl}/settings/otp`,
    'fixture:identity/success.json',
  ).as('identitySetOtp');
  cy.route(
    'DELETE',
    `${identityAPIUrl}/settings/otp`,
    'fixture:identity/success.json',
  ).as('identityDeleteOtp');
  cy.route(
    'POST',
    `${identityAPIUrl}/tokens/**`,
    'fixture:identity/success.json',
  ).as('identityAddToken');
  cy.route(
    'DELETE',
    `${identityAPIUrl}/tokens/**`,
    'fixture:identity/success.json',
  ).as('identityDeleteToken');
  cy.route(
    'POST',
    `${identityAPIUrl}/networks/*`,
    'fixture:identity/success.json',
  ).as('identityAddNetwork');
  cy.route(
    'DELETE',
    `${identityAPIUrl}/networks/*`,
    'fixture:identity/success.json',
  ).as('identityDeleteNetwork');
});
