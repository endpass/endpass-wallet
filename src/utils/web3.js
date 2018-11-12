// Wrapper around global web3 instance
import Web3 from 'web3';
import { providerFactory } from '@/class/provider';
import { DEFAULT_NETWORKS } from '@/constants';

const defaultProvider = providerFactory(DEFAULT_NETWORKS[0].url);

const createWeb3Instance = (provider = defaultProvider) => new Web3(provider);

const web3 = createWeb3Instance();

// Make web3 global for integration tests
if (window.Cypress) {
  window.web3 = web3;
}

export default web3;
