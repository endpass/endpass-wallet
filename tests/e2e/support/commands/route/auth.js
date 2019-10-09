import { identityAPIUrl } from '@config';

Cypress.Commands.add('mockVerificationCode', () => {
  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/auth/code`,
    status: 200,
    response: {},
  }).as('verificationCode');
});
