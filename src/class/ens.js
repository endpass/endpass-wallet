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

export class ENSResolver {
  constructor(web3) {
    this.NameNotFound = new Error("Name is't resolvable");
    this.getAddress = async function(name) {
      const registryContract = new web3.eth.Contract(ABI);
      const node = namehash.hash(name);
      const netId = await web3.eth.net.getId();
      registryContract.options.address = registryAddresses[netId];
      const addres = await registryContract.methods.resolver(node).call();
      if (addres == '0x0000000000000000000000000000000000000000') {
        throw this.NameNotFound;
      }
      return addres;
    };
  }
}
