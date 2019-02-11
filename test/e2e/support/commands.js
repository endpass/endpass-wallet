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
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import path from 'path';
import { v3password } from '../fixtures/accounts';
import {
  syncing,
  blockNumber,
  getBlockByNumber,
  getBalance_b14ab,
  getBalance_6bbf1,
  getBalance_31ea8,
  getTransactionCount_b14ab,
  call_b14ab,
  call_31ea8,
  call_custom_token_1,
  call_custom_token_2,
  call_custom_token_3,
  call_custom_token_4,
  call_custom_token_5,
  estimateGas,
  estimateGas_31ea8,
  sendRawTransaction_b14ab_31ea8,
  getTransactionReceipt_b14ab_31ea8,
  sendRawTransaction_b14ab_31ea8_cancel,
  getTransactionReceipt_b14ab_31ea8_cancel,
  sendRawTransaction_b14ab_31ea8_resend,
  getTransactionReceipt_b14ab_31ea8_resend,
} from '../fixtures/web3';
import {
  ethplorerHistory,
  ethplorerTransactions,
} from '../fixtures/transactions';

const identityAPIUrl = 'https://identity-dev.endpass.com/api/v1.1';
const cryptodataAPIUrl = '/cryptodata/api/v1';

// Sets up server and routes to stub logged in user with fixtures.
// Usage: cy.login()
Cypress.Commands.add('login', () => {
  cy.server();

  // Keystore server
  cy.route('GET', `${identityAPIUrl}/info`, 'fixture:keystore/info.json').as(
    'keystoreInfo',
  );
  cy.route(
    'GET',
    `${identityAPIUrl}/accounts`,
    'fixture:keystore/accounts.json',
  ).as('keystoreAccounts');
  // Regular account
  cy.route(
    'GET',
    `${identityAPIUrl}/account/0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c`,
    'fixture:keystore/account_1.json',
  ).as('keystoreAccount');
  // HD account
  cy.route(
    'GET',
    `${identityAPIUrl}/account/xpub*`,
    'fixture:keystore/account_0.json',
  ).as('keystoreHdAccount');
  cy.route(
    'POST',
    `${identityAPIUrl}/account/xpub*/info`,
    'fixture:identity/success.json',
  ).as('saveKeystoreHdAccountInfo');
  // Read only account
  cy.route(
    'GET',
    `${identityAPIUrl}/account/0x6bBf1DEa0d21eaFd232e281A196E6f11906054df`,
    {},
  ).as('publicAccount');
  cy.route(
    'POST',
    `${identityAPIUrl}/account/*`,
    'fixture:identity/success.json',
  ).as('keystoreAddAccount');
  cy.route(
    'POST',
    `${identityAPIUrl}/accounts`,
    'fixture:identity/success.json',
  ).as('keystoreUpdateAccounts');

  // Identity server
  cy.route(
    'GET',
    `${identityAPIUrl}/settings`,
    'fixture:identity/user.json',
  ).as('identityUser');
  cy.route(
    'POST',
    `${identityAPIUrl}/settings`,
    'fixture:identity/success.json',
  ).as('identityPostSettings');
  cy.route(
    'GET',
    `${identityAPIUrl}/settings/otp`,
    'fixture:identity/otp.json',
  ).as('identityOtp');
  cy.route(
    'POST',
    `${identityAPIUrl}/settings/otp`,
    'fixture:identity/success.json',
  ).as('identitySetOtp');
  cy.route(
    'DELETE',
    `${identityAPIUrl}/settings/otp`,
    'fixture:identity/success.json',
  ).as('identityDeleteOtp');
  cy.route(
    'POST',
    `${identityAPIUrl}/tokens/**`,
    'fixture:identity/success.json',
  ).as('identityAddToken');
  cy.route(
    'DELETE',
    `${identityAPIUrl}/tokens/**`,
    'fixture:identity/success.json',
  ).as('identityDeleteToken');
  cy.route(
    'POST',
    `${identityAPIUrl}/networks/*`,
    'fixture:identity/success.json',
  ).as('identityAddNetwork');
  cy.route(
    'DELETE',
    `${identityAPIUrl}/networks/*`,
    'fixture:identity/success.json',
  ).as('identityDeleteNetwork');
  cy.route('GET', /\/account\/(\w+)\/info$/, {}).as('accountInfo');
});

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
    'fixture:tokeninfo/tokens.json',
  ).as('tokenInfo');
});

Cypress.Commands.add('getGasPrice', () => {
  cy.route(
    'GET',
    `${cryptodataAPIUrl}/gas/price`,
    'fixture:cryptodata/gasprice',
  ).as('gasPrice');
});

Cypress.Commands.add('mockEthplorerRequests', () => {
  cy.route({
    method: 'GET',
    url: '/getAddressTransactions/*',
    response: ethplorerTransactions,
    status: 200,
  }).as('addressTransactionsRequest');
  cy.route({
    method: 'GET',
    url: '/getAddressHistory/*',
    response: {
      operations: ethplorerHistory,
    },
    status: 200,
  }).as('addressHistoryRequest');
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
  return type === 'application/json' || path.extname(fileUrl) === 'json'
    ? cy
        .fixture(fileUrl)
        .then(JSON.stringify)
        .then(jsonStr => new Blob([jsonStr], { type: 'application/json' }))
    : cy.fixture(fileUrl, 'base64').then(Cypress.Blob.base64StringToBlob);
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

// Mock web3 requests. Use after the cy.visit() command
Cypress.Commands.add('mockWeb3Requests', () => {
  cy.window()
    .its('web3.currentProvider')
    .as('mockWeb3Provider')
    .then(provider => {
      if (!provider.mockResolvedValue) {
        console.warn(
          'cy.mockWeb3Provider: Use web3 MockProvider to mock requests to Ethereum nodes',
        );
        return;
      }

      provider.mockResolvedValue(syncing.payload, syncing.result);
      provider.mockResolvedValue(blockNumber.payload, blockNumber.result);
      provider.mockResolvedValue(
        getBlockByNumber.payload,
        getBlockByNumber.result,
      );

      provider.mockResolvedValue(
        getBalance_b14ab.payload,
        getBalance_b14ab.result,
      );
      provider.mockResolvedValue(
        getBalance_6bbf1.payload,
        getBalance_6bbf1.result,
      );
      provider.mockResolvedValue(
        getBalance_31ea8.payload,
        getBalance_31ea8.result,
      );

      provider.mockResolvedValue(
        getTransactionCount_b14ab.payload,
        getTransactionCount_b14ab.result,
      );

      provider.mockResolvedValue(call_b14ab.payload, call_b14ab.result);
      provider.mockResolvedValue(call_31ea8.payload, call_31ea8.result);
      provider.mockResolvedValue(
        call_custom_token_1.payload,
        call_custom_token_1.result,
      );
      provider.mockResolvedValue(
        call_custom_token_2.payload,
        call_custom_token_2.result,
      );
      provider.mockResolvedValue(
        call_custom_token_3.payload,
        call_custom_token_3.result,
      );
      provider.mockResolvedValue(
        call_custom_token_4.payload,
        call_custom_token_4.result,
      );
      provider.mockResolvedValue(
        call_custom_token_5.payload,
        call_custom_token_5.result,
      );

      provider.mockResolvedValue(estimateGas.payload, estimateGas.result);
      provider.mockResolvedValue(
        estimateGas_31ea8.payload,
        estimateGas_31ea8.result,
      );

      provider.mockResolvedValue(
        sendRawTransaction_b14ab_31ea8.payload,
        sendRawTransaction_b14ab_31ea8.result,
      );
      provider.mockResolvedValue(
        getTransactionReceipt_b14ab_31ea8.payload,
        getTransactionReceipt_b14ab_31ea8.result,
      );

      provider.mockResolvedValueOnce(
        sendRawTransaction_b14ab_31ea8_cancel.payload,
        sendRawTransaction_b14ab_31ea8_cancel.result,
      );
      provider.mockResolvedValueOnce(
        getTransactionReceipt_b14ab_31ea8_cancel.payload,
        getTransactionReceipt_b14ab_31ea8_cancel.result,
      );

      provider.mockResolvedValueOnce(
        sendRawTransaction_b14ab_31ea8_resend.payload,
        sendRawTransaction_b14ab_31ea8_resend.result,
      );
      provider.mockResolvedValueOnce(
        getTransactionReceipt_b14ab_31ea8_resend.payload,
        getTransactionReceipt_b14ab_31ea8_resend.result,
      );
    });
});
