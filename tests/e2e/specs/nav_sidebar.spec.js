describe('Navigation sidebar', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('#/');
    cy.mockWeb3Requests();
  });

  it('should show sidebar controls', () => {
    cy.get('.nav-sidebar').within(() => {
      cy.contains('Logout');

      // Network select
      cy.get('.net-select .multiselect');
      cy.get('.provider-select .multiselect');

      // Account select
      cy.get('.account-chooser .multiselect');

      // Navigation
      cy.get('a[href$="/history"]');
      cy.get('a[href$="/send"]');
      cy.get('a[href$="/receive"]');
      cy.get('a[href$="/tokens"]');
      cy.get('a[href$="/settings"]');
      cy.get('a[href$="/message"]');
    });
  });
});
