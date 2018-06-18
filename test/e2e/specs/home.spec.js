describe('Home page', () => {
  it('Should display the main headline.', () => {
    cy.visit('/')
    cy.contains('Welcome')
  })
})
