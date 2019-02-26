// Wrapper around global web3 instance
import { ProviderFactory, Web3Factory } from '@endpass/class';
import { DEFAULT_NETWORKS } from '@/constants';

const defaultProvider = ProviderFactory.create(DEFAULT_NETWORKS[0].url);

const web3 = Web3Factory.create(defaultProvider);

// Make web3 global for integration tests
if (window.Cypress) {
  window.web3 = web3;
}

export default web3;
