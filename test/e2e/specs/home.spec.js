describe('Home Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    // cy.getAccountBalance();
    cy.visit('#/');
    cy.mockWeb3Requests();
    cy.makeStoreAlias();
    cy.waitPageLoad();
    cy.wait('@identityUser');
  });

  it('should contain account address and export button for private account', () => {
    cy.get('@store').then(store => {
      cy.get('[data-test=address-card] h5').contains(
        store.state.accounts.address,
      );
    });
    cy.get('[data-test=export-wallet-button]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/#/export`);
    cy.switchAccount();
    cy.get('[data-test=export-wallet-button]').should('not.exist');
  });

  describe('user tokens', () => {
    it('should render user current account tokens', () => {
      cy.get('[data-test=user-token]')
        .its('length')
        .should('eq', 1);
    });

    it('should change visible state of test ETH button', () => {
      cy.get('[data-test=get-test-eth-button]').should('not.exist');

      cy.switchCurrency('ETH-TEST');

      cy.get('[data-test=get-test-eth-button]').should('exist');

      cy.switchCurrency('ETH');

      cy.get('[data-test=get-test-eth-button]').should('not.exist');
    });

    it('should pass faucet ETH', () => {
      cy.switchCurrency('ETH-TEST');

      cy.route('GET', 'https://faucet.ropsten.be/donate/**', {
        data: {},
      });

      cy.get('[data-test=get-test-eth-button]').click();
      cy.get('[data-test=get-test-eth-button]').contains(
        'Next try after 2 mins',
      );
      cy.get('.notification.is-info').contains(
        'Please wait couple of minutes for receive ETH',
      );
    });

    it('should not pass faucet ETH', () => {
      cy.switchCurrency('ETH-TEST');

      cy.route(() => ({
        method: 'GET',
        url: 'https://faucet.ropsten.be/donate/**',
        status: 404,
        response: { data: { duration: 100000 } },
      }));

      cy.get('[data-test=get-test-eth-button]').click();
      cy.get('[data-test=get-test-eth-button]').contains('Too many attempts');

      cy.get('.notification.is-warning').contains(
        'Your wallet address is banned',
      );
    });

    it('should correctly navigate to add token page', () => {
      cy.get('[data-test=edit-tokens-button]').click();
      cy.url().should('eq', `${Cypress.config().baseUrl}/#/tokens`);
    });
  });
});
