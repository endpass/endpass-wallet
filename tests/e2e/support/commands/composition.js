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
  cy.mockAuthCheck();
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

Cypress.Commands.add('mockAccountsDataFailed', () => {
  cy.mockAccountsList(401);
  cy.mockUserSettings(401);
  cy.mockAuthCheck(401);
});
