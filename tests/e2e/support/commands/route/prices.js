import { cryptodataAPIUrl, mainNetworkId } from '@config';
import { gasPrice } from '@fixtures/cryptodata';

Cypress.Commands.add('mockTokenPrices', () => {
  cy.route({
    method: 'GET',
    url: `${cryptodataAPIUrl}/price?**`,
    response: {
      BNB: { USD: 0 },
      ZRX: { USD: 0 },
      $FFC: { USD: 0 },
      ETH: { USD: 200 },
    },
    status: 200,
  }).as('tokenPrices');
});

Cypress.Commands.add('mockGasPrice', () => {
  cy.route(
    'GET',
    `${cryptodataAPIUrl}/${mainNetworkId}/gas/price`,
    gasPrice,
  ).as('gasPriceMain');
});
