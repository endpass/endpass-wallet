// Wrapper around global web3 instance
import Web3Factory from '@/class/web3/Web3Factory';
import { ProviderFactory } from '@endpass/class';
import { DEFAULT_NETWORKS } from '@/constants';

const defaultProvider = ProviderFactory.create(DEFAULT_NETWORKS[0].url);

const web3 = Web3Factory.create(defaultProvider);

// Make web3 global for integration tests
if (window.Cypress) {
  window.web3 = web3;
}

export default web3;
