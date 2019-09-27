import { tokeninfoAPIUrl, tokenImageAPIUrl } from '@config';
import { networkTokens } from '@fixtures/tokeninfo';

Cypress.Commands.add('mockTokensInfo', () => {
  // Token info server
  cy.route('GET', `${tokeninfoAPIUrl}/tokens`, networkTokens).as('tokenInfo');

  cy.route({
    method: 'GET',
    url: `${tokenImageAPIUrl}/**`,
    response: {},
    status: 404,
  }).as('tokenInfoImage');
});
