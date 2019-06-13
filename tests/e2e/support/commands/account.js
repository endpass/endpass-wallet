/* eslint-disable camelcase */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress
// .Commands
// .add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress
// .Commands
// .add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import path from 'path';
import { v3password } from '../../fixtures/accounts';
import { tokenTransactions, ethTransactions } from '../../fixtures/cryptodata';
import { tokens, prices } from '../../fixtures/tokeninfo';

import { identityAPIUrl, cryptodataAPIUrl, mainNetworkId } from './config';

// Sets up server and routes to stub logged in user with fixtures.

// Sets up server and routes for an unauthorized user.
// Usage: cy.preventLogin()
Cypress.Commands.add('preventLogin', () => {
  cy.server();
  cy.route({
    url: `${identityAPIUrl}/accounts`,
    response: {},
    status: 401,
  }).as('keystoreAccountsNotLogin');

  cy.route({
    url: `${identityAPIUrl}/settings`,
    response: {},
    status: 401,
  }).as('identityUserNotLogin');
});

Cypress.Commands.add('authCheck', () => {
  cy.server();
  cy.route({
    url: `${identityAPIUrl}/auth/check`,
    response: {},
    status: 200,
  }).as('authCheckLoggedIn');
});

Cypress.Commands.add('getAccountsInfo', () => {
  cy.route(
    'GET',
    /\/getAddressInfo\/0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c/,
    'fixture:addressinfo/b14ab.json',
  ).as('addressInfo_b14ab');
  cy.route(
    'GET',
    /\/getAddressInfo\/0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d/,
    'fixture:addressinfo/31ea8.json',
  ).as('addressInfo_31ea8');
});

Cypress.Commands.add('getTokensInfo', () => {
  // Token info server
  cy.route(
    'GET',
    '/tokeninfo/api/v1/tokens',
    'fixture:tokeninfo/networkTokens.json',
  ).as('tokenInfo');
});

Cypress.Commands.add('getGasPrice', () => {
  cy.route(
    'GET',
    `${cryptodataAPIUrl}/${mainNetworkId}/gas/price`,
    'fixture:cryptodata/gasprice',
  ).as('gasPriceMain');
});

Cypress.Commands.add('getAccountBalance', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/*/balance/**`,
    response: {
      balance: '2000000000000000000',
      tokens,
    },
  }).as('accountBalance');
});

Cypress.Commands.add('loadTokenPrices', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/price`,
    response: prices,
  }).as('tokensPrices');
});

Cypress.Commands.add('mockEthplorerRequests', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/**/transactions/*`,
    response: ethTransactions,
    status: 200,
  }).as('addressHistoryRequest');
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/**/transactions/*/token*`,
    response: tokenTransactions,
    status: 200,
  }).as('addressTransactionsRequest');
});

Cypress.Commands.add('getInitialData', () => {
  cy.login();
  cy.getAccountsInfo();
  cy.getTokensInfo();
  cy.getGasPrice();
  cy.mockEthplorerRequests();
});

Cypress.Commands.add('waitPageLoad', () => {
  cy.get('main').should('be.visible');
  cy.wait(1000);
  cy.get('[data-test=page-loader]', {
    timeout: 50000,
  }).should('be.not.exist');
});

Cypress.Commands.add('inputPassword', () => {
  cy.get('[data-test=input-password]').type(v3password);
  cy.get('[data-test=submit-password]').click();
});

Cypress.Commands.add('inputInvalidPassword', () => {
  cy.get('[data-test=input-password]').type('12341234');
  cy.get('[data-test=submit-password]').click();
});

/**
 * Converts fixture to Blob. All file types are converted to base64 then
 * converted to a Blob using Cypress expect application/json. Json files are
 * just stringified then converted to a blob (fixes issue invalid Blob issues).
 * @param {String} fileUrl - The file url to upload
 * @param {String} type - content type of the uploaded file
 * @return {Promise} Resolves with blob containing fixture contents
 */
function getFixtureBlob(fileUrl, type) {
  if (type === 'application/json' || path.extname(fileUrl) === 'json') {
    return cy
      .fixture(fileUrl)
      .then(JSON.stringify)
      .then(jsonStr => new Blob([jsonStr], { type: 'application/json' }));
  }

  return cy.fixture(fileUrl, 'base64').then(Cypress.Blob.base64StringToBlob);
}

/**
 * Uploads a file to an input
 * @memberOf Cypress.Chainable#
 * @name uploadFile
 * @function
 * @param {String} selector - element to target
 * @param {String} fileUrl - The file url to upload
 * @param {String} type - content type of the uploaded file
 */
Cypress.Commands.add('uploadFile', (selector, fileUrl, type = '') =>
  cy.get(selector).then(subject =>
    getFixtureBlob(fileUrl, type).then(blob =>
      cy.window().then(win => {
        const name = fileUrl.split('/').pop();
        const testFile = new win.File([blob], name, { type: blob.type });
        const dataTransfer = new win.DataTransfer();
        const el = subject[0];

        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;

        return subject;
      }),
    ),
  ),
);

Cypress.Commands.add('switchCurrency', netName => {
  cy.get('[data-test=currency-select]')
    .click()
    .within(() => {
      cy.contains(netName).click();
    });
});

Cypress.Commands.add('makeStoreAlias', () => {
  cy.window()
    .its('app.$store')
    .as('store');
});

Cypress.Commands.add('switchAccount', () => {
  cy.get('[data-test=account-chooser]')
    .click()
    .within(() => {
      cy.get('[data-select]:not(.multiselect__option--selected)').click();
    });
});

Cypress.Commands.add('getBalanceTokenElement', () =>
  cy.get('.info-item:nth-child(2) [data-test=balance-value]'),
);
