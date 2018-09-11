// Wrapper around global web3 instance
import Web3 from 'web3';
import { providerFactory } from '@/class';
import { DEFAULT_NETWORKS } from '@/constants';

const defaultProvider = providerFactory(DEFAULT_NETWORKS[0].url);

const createWeb3Instance = (provider = defaultProvider) => new Web3(provider);

export default createWeb3Instance();
