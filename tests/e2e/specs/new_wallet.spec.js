describe('New Wallet Page', () => {
  it('should generate a new wallet and display seed phrase', () => {
    cy.mockInitialData();
    cy.route({
      method: 'GET',
      url: 'https://identity-dev.endpass.com/api/v1.1/accounts',
      response: [],
      status: 200,
    }).as('keystoreGetEmptyAccounts');

    cy.visit('#/new');
    cy.waitPageLoad();
    cy.wait(['@keystoreGetEmptyAccounts']);

    cy.get('[data-test=input-new-wallet-password]').type('12341234');
    cy.contains('New Wallet').click();

    cy.wait(['@keystoreAddAccount']);
    cy.contains('[data-test=seed-phrase]', /(\w+\s*){12}/); // 12 word seed phrase
    cy.wait(10000);
    cy.get('[data-test=seed-phrase]').should('contain', '');
  });
});
