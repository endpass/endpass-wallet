// Wrapper around global web3 instance
import { ProviderFactory, Web3Factory, Network } from '@endpass/class';

const defaultProvider = ProviderFactory.create(
  Network.DEFAULT_NETWORKS[Network.NET_ID.MAIN].url,
);

const web3 = Web3Factory.create(defaultProvider);

// Make web3 global for integration tests
if (window.Cypress) {
  window.web3 = web3;
}

export default web3;
