describe('New Wallet Page', () => {
  it('should generate a new wallet and display seed phrase', () => {
    cy.login();
    cy.route({
      method: 'GET',
      url: '/identity/api/v1/accounts',
      response: [],
      status: 200,
    }).as('keystoreGetEmptyAccounts');

    cy.visit('#/new');
    cy.wait(['@keystoreGetEmptyAccounts']);

    cy.get('[data-test=input-new-wallet-password]').type('12341234');
    cy.contains('New Wallet').click();

    cy.wait(['@keystoreAddAccount']);
    // temp workaround for wallet generation wait
    cy.get('[data-test=seed-phrase]').contains(/(\w+\s*){12}/, {
      timeout: 30000,
    }); // 12 word seed phrase
  });
});
