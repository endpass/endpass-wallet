describe('Receive Page', () => {
  beforeEach(() => {
    cy.getInitialData();
    cy.visit('#/receive');
    cy.waitPageLoad();
    cy.makeStoreAlias();
  });

  it('Should contain section with current user wallet public address and balance', () => {
    cy.get('@store').then(store => {
      const { wallet, wallets } = store.state.accounts;
      const { address } = wallet.v3;
      const addresses = Object.keys(wallets);

      addresses.splice(addresses.indexOf(address), 1);

      cy.get('[data-test=current-account]').contains(address);
      cy.get('[data-test=account]').each((el, i) => {
        cy.wrap(el).contains(addresses[i]);
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
      .its('state.accounts.wallet.v3.address')
      .then(currentAddress => {
        expect(currentAddress).not.eq(address);
      });
    cy.location()
      .its('href')
      .then(href => {
        expect(href.indexOf('send') !== -1).eq(true);
      });
  });
});
