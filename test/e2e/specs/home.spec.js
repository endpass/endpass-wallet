describe('Home Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    cy.visit('#/');
    cy.makeStoreAlias();
    cy.waitPageLoad();
  });

  it('should contain account address and export button for private account', () => {
    cy.get('@store').then(store => {
      cy.get('[data-test=address-card] h5').contains(
        store.state.accounts.wallet.v3.address,
      );
    });
    cy.get('[data-test=export-wallet-button]').click();
    cy.location()
      .its('href')
      .then(href => {
        expect(href.includes('export')).eq(true);
      });
  });

  // TODO: uncomment when tokens will render correctly
  // it('should render user current account tokens', () => {
  //   cy.route({
  //     method: 'GET',
  //     url: '/tokeninfo/api/v1/tokens',
  //     response: {},
  //   });
  //   cy.get('[data-test=user-token]')
  //     .its('length')
  //     .should('eq', 1);
  // });

  it('should not contain export button for public account', () => {
    cy.switchAccount();
    cy.get('[data-test=export-wallet-button]').should('not.exist');
  });

  it('should correctly navigate to add token page', () => {
    cy.get('[data-test=edit-tokens-button]').click();
    cy.location()
      .its('href')
      .then(href => {
        expect(href.includes('tokens')).eq(true);
      });
  });
});
