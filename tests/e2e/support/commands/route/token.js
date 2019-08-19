import { networkTokens } from '@fixtures/tokeninfo';

Cypress.Commands.add('mockTokensInfo', () => {
  // Token info server
  cy.route('GET', '/tokeninfo/api/v1/tokens', networkTokens).as('tokenInfo');

  cy.route({
    method: 'GET',
    url: 'https://tokeninfo-dev.endpass.com/img/**',
    response: {},
    status: 404,
  }).as('tokenInfoImage');
});
