describe('Log In To an Existing Account', () => {
  it('should show log in modal on home page', () => {
    cy.preventLogin();
    cy.visit('#/');
    cy.waitPageLoad();

    cy.get('iframe[data-endpass=frame]').should('exist');
  });

  it('should not show login modal if already logged in', () => {
    cy.mockInitialData();
    cy.visit('#/');
    cy.waitPageLoad();

    cy.get('[data-test=login-modal]').should('not.exist');
  });
});
