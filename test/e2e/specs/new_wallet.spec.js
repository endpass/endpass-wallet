describe('New Wallet Page', () => {
  it('should generate a new wallet and display seed phrase', () => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/identity/api/v1/*',
      response: {},
      status: 200,
    }).as('identityGetRequests');

    cy.visit('#/new');
    cy.wait(['@identityGetRequests']);

    cy.get('#jsonKeystorePassword input').type('12341234');
    cy.contains('New Wallet').click();
    cy.get('[data-test=seed-phrase]').contains(/(\w+\s*){12}/); // 12 word seed phrase
  });
});
