import { identityAPIUrl } from '../config';
import seed from '../../../fixtures/identity/seed';

Cypress.Commands.add('mockUserSettings', () => {
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
