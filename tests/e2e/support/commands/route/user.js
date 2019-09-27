import { identityAPIUrl } from '@config';
import { successResp, user, otp, seed } from '@fixtures/identity';

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
    response: successResp,
  }).as('saveUserSeed');

  // Identity server
  cy.route('GET', `${identityAPIUrl}/settings`, user).as('identityUser');
  cy.route('POST', `${identityAPIUrl}/settings`, successResp).as(
    'identityPostSettings',
  );
  cy.route('GET', `${identityAPIUrl}/settings/otp`, otp).as('identityOtp');
  cy.route('POST', `${identityAPIUrl}/settings/otp`, successResp).as(
    'identitySetOtp',
  );
  cy.route('DELETE', `${identityAPIUrl}/settings/otp`, successResp).as(
    'identityDeleteOtp',
  );
  cy.route('POST', `${identityAPIUrl}/tokens/**`, successResp).as(
    'identityAddToken',
  );
  cy.route('DELETE', `${identityAPIUrl}/tokens/**`, successResp).as(
    'identityDeleteToken',
  );
  cy.route('POST', `${identityAPIUrl}/networks/*`, successResp).as(
    'identityAddNetwork',
  );
  cy.route('DELETE', `${identityAPIUrl}/networks/*`, successResp).as(
    'identityDeleteNetwork',
  );
});
