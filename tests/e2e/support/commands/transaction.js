import { tokenTransactions, ethTransactions } from '../../fixtures/cryptodata';
import { cryptodataAPIUrl } from './config';

Cypress.Commands.add('mockTransactionHistory', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/**/transactions/*`,
    response: ethTransactions,
    status: 200,
  }).as('addressTransactionsHistory');

  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/**/transactions/*/token*`,
    response: tokenTransactions,
    status: 200,
  }).as('tokenTransactionsHistory');
});

Cypress.Commands.add('mockEmptyTransactionHistory', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/**/transactions/*`,
    response: [],
    status: 200,
  }).as('addressTransactionsHistory');

  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/**/transactions/*/token*`,
    response: [],
    status: 200,
  }).as('tokenTransactionsHistory');
});
