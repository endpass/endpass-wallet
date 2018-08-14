// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global Server Configuration
Cypress.Server.defaults({
  whitelist: xhr => {
    return (
      (xhr.method === 'GET' && /\.(jsx?|html|css)(\?.*)?$/.test(xhr.url)) ||
      // Ignore requests to ethereum node
      (xhr.method === 'POST' && /infura\.io/.test(xhr.url))
    );
  },
});

// Return the Vuex store
const store = () => cy.window().its('app.$store');
