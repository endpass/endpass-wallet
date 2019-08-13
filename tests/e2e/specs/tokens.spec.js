/* eslint-disable camelcase */
import {
  customToken,
  tokens,
  token,
  tokensMappedByAddress,
} from '../fixtures/tokeninfo';
import { call_custom_token_1, call_custom_token_3 } from '../fixtures/web3';

describe('Tokens Page', () => {
  describe('the user is not authorized', () => {
    it('should redirect to root', () => {
      cy.preventLogin();
      cy.visit('#/tokens');
      cy.waitPageLoad();
      cy.url().should('include', '/#/?redirect_uri=%2Ftokens');
    });
  });

  describe('the user is authorized', () => {
    describe('add a token', () => {
      beforeEach(() => {
        cy.mockInitialData();
        cy.mockPositiveBalance();
        cy.visit('#/tokens');
        cy.waitPageLoad();
        cy.wait('@positiveBalance');
      });

      it('should add a custom token', () => {
        cy.get('[data-test=add-custom-token-button]').click();

        cy.get('[data-test=add-token-modal]').within(() => {
          cy.focused().should('have.attr', 'data-test', 'address-input');
          cy.get('[data-test=find-button]').should('be.disabled');

          cy.get('[data-test=address-input]').type(customToken.address);
          cy.get('[data-test=find-button]').click();
          cy.get('[data-test=close-button]').click();
        });

        cy.get('[data-test=tokens-list]').within(() => {
          cy.get('[data-test=token-item]').should('have.length', 4);
          cy.get('[data-test=token-name]').contains(customToken.name);
        });
      });

      it('should add a token from the list', () => {
        const tokenName = token.name;

        cy.get('[data-test=tokens-select]')
          .click()
          .within(() => {
            cy.get('.multiselect__input').type('invalid token name');
            cy.contains('No elements found').should('be.visible');

            cy.get('.multiselect__input')
              .clear()
              .type(tokenName);
            cy.get('[data-test=token-name]')
              .contains(tokenName)
              .click();
          });

        cy.get('[data-test=tokens-list]').contains(tokenName);
      });
    });

    describe('add custom token', () => {
      beforeEach(() => {
        cy.mockInitialData();
        cy.visit('#/tokens');
        cy.waitPageLoad();
      });

      it('should add a custom token with token info from user', () => {
        cy.get('@mockWeb3Provider').then(provider => {
          provider.mockResolvedValueOnce(
            call_custom_token_1.payload,
            undefined,
          );
          provider.mockResolvedValueOnce(
            call_custom_token_3.payload,
            undefined,
          );
        });

        cy.get('[data-test=add-custom-token-button]').click();

        cy.get('[data-test=add-token-modal]').within(() => {
          cy.focused().should('have.attr', 'data-test', 'address-input');
          cy.get('[data-test=find-button]').should('be.disabled');

          cy.get('[data-test=address-input]').type(customToken.address);
          cy.get('[data-test=find-button]').click();
          cy.get('[data-test=add-button]').should('be.disabled');

          cy.get('[data-test=token-name-input]').type(customToken.name);
          cy.get('[data-test=token-symbol-input]').type(customToken.symbol);
          cy.get('[data-test=add-button]').click();
          cy.get('[data-test=close-button]').click();
        });

        cy.get('[data-test=tokens-list]').within(() => {
          cy.get('[data-test=token-item]').should('have.length', 2);
          cy.get('[data-test=token-name]').contains(customToken.name);
        });
      });

      it('should not add a custom token', () => {
        cy.get('[data-test=add-custom-token-button]').click();

        cy.get('[data-test=add-token-modal]').within(() => {
          cy.get('[data-test=find-button]').should('be.disabled');

          cy.get('[data-test=address-input]').type('invalid address');
          cy.contains('This is not a valid address');

          cy.get('[data-test=find-button]').should('be.disabled');
          cy.get('[data-test=close-button]').click();
        });
      });
    });

    describe('saved tokens list', () => {
      const [token1] = tokens;

      beforeEach(() => {
        cy.mockInitialData();
        cy.visit('#/tokens');
        cy.waitPageLoad();
        cy.get('@store').then(store => {
          store.commit('tokens/updateUserTokens', {
            1: tokensMappedByAddress,
          });
        });
      });

      it('should remove a token', () => {
        cy.get('[data-test=tokens-spinner]').should('not.exist');

        cy.contains(token1.name)
          .parents('[data-test=token-item]')
          .within(() => {
            cy.get('[data-test=delete-button]').click();
          });

        cy.get('[data-test=tokens-list] [data-test=token-name]').should(
          'not.contain',
          token1.name,
        );

        cy.get('[data-test=tokens-list]').should('not.exist');
        cy.get('[data-test=no-tokens-text]').contains(
          'You have no tokens on this network. Add some!',
        );
      });

      it('should find a token', () => {
        cy.get('[data-test=token-search-input] input').type(token1.name);
        cy.get('[data-test=tokens-list]').within(() => {
          cy.get('[data-test=token-name]').contains(token1.name);
        });

        cy.get('[data-test=token-search-input] input')
          .clear()
          .type('invalid token name');
        cy.get('[data-test=tokens-list]').within(() => {
          cy.contains('You have no tokens at this address').should(
            'be.visible',
          );
        });

        cy.get('[data-test=token-search-input] input').clear();
      });
    });
  });
});
