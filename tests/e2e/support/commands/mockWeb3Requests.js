/* eslint-disable camelcase */
// Mock web3 requests. Use after the cy.visit() command
import {
  blockNumber,
  call_31ea8,
  call_b14ab,
  call_custom_token_1,
  call_custom_token_2,
  call_custom_token_3,
  call_custom_token_4,
  call_custom_token_5,
  estimateGas,
  estimateGas_31ea8,
  getBalance_31ea8,
  getBalance_6bbf1,
  getBalance_b14ab,
  getBlockByNumber,
  getTransactionCount_b14ab,
  getTransactionReceipt_b14ab_31ea8,
  getTransactionReceipt_b14ab_31ea8_cancel,
  getTransactionReceipt_b14ab_31ea8_resend,
  sendRawTransaction_b14ab_31ea8,
  sendRawTransaction_b14ab_31ea8_cancel,
  sendRawTransaction_b14ab_31ea8_resend,
  syncing,
  ethSubscribe,
} from '../../fixtures/web3';

Cypress.Commands.add('mockWeb3Requests', () => {
  cy.window()
    .its('web3.currentProvider')
    .as('mockWeb3Provider')
    .then(provider => {
      if (!provider.mockResolvedValue) {
        // eslint-disable-next-line no-console
        console.warn(
          'cy.mockWeb3Provider: Use web3 MockProvider to mock requests to Ethereum nodes',
        );
        return;
      }

      provider.mockResolvedValue(ethSubscribe.payload, ethSubscribe.result);

      provider.mockResolvedValue(syncing.payload, syncing.result);
      provider.mockResolvedValue(blockNumber.payload, blockNumber.result);
      provider.mockResolvedValue(
        getBlockByNumber.payload,
        getBlockByNumber.result,
      );

      provider.mockResolvedValue(
        getBalance_b14ab.payload,
        getBalance_b14ab.result,
      );
      provider.mockResolvedValue(
        getBalance_6bbf1.payload,
        getBalance_6bbf1.result,
      );
      provider.mockResolvedValue(
        getBalance_31ea8.payload,
        getBalance_31ea8.result,
      );

      provider.mockResolvedValue(
        getTransactionCount_b14ab.payload,
        getTransactionCount_b14ab.result,
      );

      provider.mockResolvedValue(call_b14ab.payload, call_b14ab.result);
      provider.mockResolvedValue(call_31ea8.payload, call_31ea8.result);
      provider.mockResolvedValue(
        call_custom_token_1.payload,
        call_custom_token_1.result,
      );
      provider.mockResolvedValue(
        call_custom_token_2.payload,
        call_custom_token_2.result,
      );
      provider.mockResolvedValue(
        call_custom_token_3.payload,
        call_custom_token_3.result,
      );
      provider.mockResolvedValue(
        call_custom_token_4.payload,
        call_custom_token_4.result,
      );
      provider.mockResolvedValue(
        call_custom_token_5.payload,
        call_custom_token_5.result,
      );

      provider.mockResolvedValue(estimateGas.payload, estimateGas.result);
      provider.mockResolvedValue(
        estimateGas_31ea8.payload,
        estimateGas_31ea8.result,
      );

      provider.mockResolvedValue(
        sendRawTransaction_b14ab_31ea8.payload,
        sendRawTransaction_b14ab_31ea8.result,
      );
      provider.mockResolvedValue(
        getTransactionReceipt_b14ab_31ea8.payload,
        getTransactionReceipt_b14ab_31ea8.result,
      );

      provider.mockResolvedValueOnce(
        sendRawTransaction_b14ab_31ea8_cancel.payload,
        sendRawTransaction_b14ab_31ea8_cancel.result,
      );
      provider.mockResolvedValueOnce(
        getTransactionReceipt_b14ab_31ea8_cancel.payload,
        getTransactionReceipt_b14ab_31ea8_cancel.result,
      );

      provider.mockResolvedValueOnce(
        sendRawTransaction_b14ab_31ea8_resend.payload,
        sendRawTransaction_b14ab_31ea8_resend.result,
      );
      provider.mockResolvedValueOnce(
        getTransactionReceipt_b14ab_31ea8_resend.payload,
        getTransactionReceipt_b14ab_31ea8_resend.result,
      );
    });
});
