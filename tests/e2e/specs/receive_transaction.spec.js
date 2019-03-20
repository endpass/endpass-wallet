describe('Receive Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    cy.visit('#/receive');
    cy.mockWeb3Requests();
    cy.waitPageLoad();
    cy.makeStoreAlias();
  });

  it('Should contain section with current user wallet public address and balance', () => {
    cy.get('@store').then(store => {
      const { wallets } = store.state.accounts;
      const wallet = store.getters['accounts/wallet'];
      const addresses = Object.keys(wallets);

      cy.get('[data-test=current-account]').contains(wallet.v3.address);
      cy.get('[data-test=account]').each((el, i) => {
        // Increment because addresses includes current account address
        cy.wrap(el).contains(addresses[i + 1]);
      });
    });

    // Should not render send button for public accounts
    cy.get('[data-test=account] [data-test=send-button]').should('not.exist');
  });

  it('Should switch current account with sidebar accounts select', () => {
    let address;

    cy.get('[data-test=current-account] h5').then(account => {
      address = account.text();
    });
    cy.switchAccount();
    cy.get('[data-test=current-account] h5').then(account => {
      const newAddress = account.text();

      expect(newAddress).not.eq(address);

      address = newAddress;
    });

    // Should go to send page and change account after click send button
    cy.get('[data-test=account] [data-test=send-button]').click();
    cy.get('@store')
      .its('getters')
      .its('accounts/wallet')
      .its('v3.address')
      .should('not.eq', address);
    cy.url().should('contain', 'send');
  });
});
