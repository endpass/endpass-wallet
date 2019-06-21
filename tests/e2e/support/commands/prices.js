import { cryptodataAPIUrl } from './config';

Cypress.Commands.add('mockTokenPriceFFC', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/price?from=$FFC&**`,
    response: {},
    status: 404,
  }).as('mockTokenPriceFFC');
});

Cypress.Commands.add('mockTokenPriceUSD', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/price?from=ETH&to=USD`,
    response: {
      USD: 200,
    },
    status: 200,
  }).as('mockTokenPriceUSD');
});
