import { cryptodataAPIUrl } from './config';
import { tokens } from '../../fixtures/tokeninfo';

Cypress.Commands.add('mockZeroBalance', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/*/balance/**`,
    response: {
      balance: '0',
      tokens: [],
    },
    status: 200,
  }).as('mockZeroBalance');
});

Cypress.Commands.add('mockPositiveBalance', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/*/balance/**`,
    response: {
      balance: '2000000000000000000',
      tokens,
    },
  }).as('mockPositiveBalance');
});
