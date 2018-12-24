import Web3 from 'web3';
import { get } from 'lodash';

export default class Web3Factory {
  static create(provider) {
    const web3 = new Web3();

    web3.setProvider(provider);

    return web3;
  }
}
