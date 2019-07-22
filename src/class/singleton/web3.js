// Wrapper around global web3 instance
import Web3 from 'web3';
import { ProviderFactory, Network } from '@endpass/class';

const defaultProvider = ProviderFactory.create(
  Network.DEFAULT_NETWORKS[Network.NET_ID.MAIN].url,
);

const createWeb3Instance = provider => {
  const web3 = new Web3();

  web3.setProvider(provider);

  return web3;
};

const web3 = createWeb3Instance(defaultProvider);

// Make web3 global for integration tests
if (window.Cypress) {
  window.web3 = web3;
}

export default web3;
