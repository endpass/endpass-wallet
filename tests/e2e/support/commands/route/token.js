Cypress.Commands.add('mockTokensInfo', () => {
  // Token info server
  cy.route(
    'GET',
    '/tokeninfo/api/v1/tokens',
    'fixture:tokeninfo/networkTokens.json',
  ).as('tokenInfo');

  cy.route({
    method: 'GET',
    url: 'https://tokeninfo-dev.endpass.com/img/**',
    response: {},
    status: 404,
  }).as('tokenInfoImage');
});
