import path from 'path';
import { v3password } from '@fixtures/accounts';

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
        const changeEvent = new Event('change');

        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        el.dispatchEvent(changeEvent);

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

Cypress.Commands.add('makeStoreAlias', () => {
  cy.window()
    .its('app.$store')
    .as('store');
});

Cypress.Commands.add('waitPageLoad', () => {
  cy.mockWeb3Requests();
  cy.makeStoreAlias();
  cy.window().then(win => win.startCypressTest());
  cy.get('main').should('be.visible');
  cy.wait(1000);
  cy.get('[data-test=page-loader]', {
    timeout: 50000,
  }).should('be.not.exist');
});
