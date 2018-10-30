import namehash from 'eth-ens-namehash';
import ABI from '@/abi/ens.json';

const registryAddresses = {
  // Mainnet
  '1': '0x314159265dd8dbb310642f98f50c066173c1259b',
  // Ropsten
  '3': '0x112234455c3a32fd11230c42e7bccd4a84e02010',
  // Rinkeby
  '4': '0xe7410170f87102DF0055eB195163A03B7F2Bff4A',
  // Ethereum Classic
  '61': '0xb96836a066ef81ea038280c733f833f69c23efde',
};

export default class ENSResolver {
  constructor(web3) {
    this.web3 = web3;
  }

  async getAddress(name) {
    const { Contract, net } = this.web3.eth;
    const registryContract = new Contract(ABI);
    const netId = await net.getId();
    const node = namehash.hash(name);

    Object.assign(registryContract.options, {
      address: registryAddresses[netId],
    });

    const address = await registryContract.methods.resolver(node).call();

    if (address === '0x0000000000000000000000000000000000000000') {
      throw new Error("Name isn't resolvable");
    }

    return address;
  }
}
