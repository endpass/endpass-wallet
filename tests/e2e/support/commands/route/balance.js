import { tokens } from '@fixtures/tokeninfo';
import { cryptodataAPIUrl } from '@config';

Cypress.Commands.add('mockZeroBalance', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/*/balance/**`,
    response: {
      balance: '0',
      tokens: [],
    },
    status: 200,
  }).as('zeroBalance');
});

Cypress.Commands.add('mockPositiveBalance', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/*/balance/**`,
    response: {
      balance: '2000000000000000000',
      tokens,
    },
  }).as('positiveBalance');
});
