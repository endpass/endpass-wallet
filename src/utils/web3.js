// Wrapper around global web3 instance
import Web3 from 'web3';
import { providerFactory } from '@/class/provider';
import { DEFAULT_NETWORKS } from '@/constants';

const defaultProvider = providerFactory(DEFAULT_NETWORKS[0].url);

const createWeb3Instance = (provider = defaultProvider) => new Web3(provider);

const web3 = createWeb3Instance();

/**
 * Returns code of contract
 * If given address of contract must return hash, else returns "0x"
 * @param {String} address Address string
 * @returns {Promise<String>} Code of contract
 */
export const getCodeFromAddress = address => web3.eth.getCode(address);

/**
 * Checks and returns is it address of contract
 * @param {String} address Address string
 * @returns {Promise<Boolean>} Check result
 */
export const isAddressOfContract = async address => {
  const res = await getCodeFromAddress(address);

  return res !== '0x';
};

// Make web3 global for integration tests
if (window.Cypress) {
  window.web3 = web3;
}

export default web3;
