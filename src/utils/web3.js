// Wrapper around global web3 instance
import Web3 from 'web3';

function createWeb3Instance() {
  const web3 = new Web3();

  return web3;
}

export default createWeb3Instance();
