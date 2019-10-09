// Sets up server and routes for an unauthorized user.
// Usage: cy.preventLogin()
Cypress.Commands.add('preventLogin', () => {
  cy.server();
  cy.mockAccountsDataFailed();
});

Cypress.Commands.add('login', () => {
  cy.server();
  cy.mockAccountKeystores();
  cy.mockUserSettings();
});

Cypress.Commands.add('mockPrices', () => {
  cy.mockTokenPrices();
  cy.mockZeroBalance();
  cy.mockGasPrice();
});

Cypress.Commands.add('mockInitialData', () => {
  cy.login();
  cy.mockVerificationCode();
  cy.mockTokensInfo();
  cy.mockEmptyTransactionHistory();
  cy.mockPrices();
});
