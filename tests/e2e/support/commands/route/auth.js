import { identityAPIUrl } from '@config';

Cypress.Commands.add('mockAuthCheck', (status = 200) => {
  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/auth/check`,
    status,
    response: {},
  });
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/auth/check`,
    status,
    response: {},
  });
});

Cypress.Commands.add('mockVerificationCode', () => {
  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/auth/code`,
    status: 200,
    response: {},
  }).as('verificationCode');
});
