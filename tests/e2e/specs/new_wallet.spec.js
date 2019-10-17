import { checksumAddress, generatedWalletData } from '@fixtures/accounts';

describe('New Wallet Page', () => {
  it('should generate a new wallet and display seed phrase', () => {
    cy.mockInitialData();

    cy.mockAccountsList(200, []);

    cy.visit('#/');
    cy.waitPageLoad();

    cy.get('@store').then(store => {
      cy.stub(
        store._actions['accounts/generateNewWallet'],
        '0',
        () => new Promise(resolve => resolve(generatedWalletData)),
      );
    });

    cy.get('[data-test=create-new-wallet]').click();
    cy.get('[data-test=continue-button]').click();
    cy.get('[data-test=address-card] [data-test=account-address]').should(
      'contain',
      checksumAddress,
    );
  });
});
