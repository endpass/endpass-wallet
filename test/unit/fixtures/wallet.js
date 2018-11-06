import web3 from 'web3';

const privKey = Uint8Array.from([
  252,
  66,
  239,
  192,
  201,
  67,
  46,
  194,
  176,
  55,
  128,
  83,
  240,
  234,
  79,
  104,
  162,
  194,
  16,
  119,
  38,
  61,
  206,
  223,
  195,
  45,
  217,
  208,
  241,
  125,
  96,
  56,
]);
const pubKey = Uint8Array.from([
  62,
  85,
  40,
  11,
  22,
  92,
  113,
  252,
  92,
  43,
  24,
  46,
  112,
  85,
  186,
  178,
  114,
  51,
  49,
  194,
  18,
  182,
  64,
  228,
  33,
  83,
  161,
  235,
  178,
  34,
  156,
  65,
  251,
  253,
  9,
  106,
  197,
  149,
  208,
  196,
  246,
  88,
  217,
  1,
  49,
  67,
  216,
  37,
  101,
  229,
  116,
  138,
  14,
  139,
  102,
  67,
  131,
  206,
  73,
  214,
  71,
  94,
  47,
  143,
]);
const address = Uint8Array.from([
  158,
  206,
  239,
  223,
  53,
  84,
  225,
  120,
  166,
  84,
  144,
  6,
  242,
  192,
  33,
  99,
  230,
  60,
  159,
  216,
]);

class EthereumWalletMock {
  constructor() {
    this._privKey = privKey;
    this._pubKey = pubKey;
    this.privKey = privKey;
    this.pubKey = pubKey;
  }

  generate() {
    return this;
  }

  getAddress() {
    return address;
  }

  getChecksumAddressString() {
    return web3.utils.toChecksumAddress(
      `0x${Buffer.from(this.getAddress()).toString('hex')}`,
    );
  }

  getPrivateKey() {
    return this.privKey;
  }

  getPrivateKeyString() {
    return '0xfc42efc0c9432ec2b0378053f0ea4f68a2c21077263dcedfc32dd9d0f17d6038';
  }

  getPublicKey() {
    return this.pubKey;
  }

  async getBalance() {
    return await web3.eth.getBalance(this.getChecksumAddressString());
  }

  getPublicKeyString() {
    return '0x3e55280b165c71fc5c2b182e7055bab2723331c212b640e42153a1ebb2229c41fbfd096ac595d0c4f658d9013143d82565e5748a0e8b664383ce49d6475e2f8f';
  }

  getV3Filename() {
    return 'UTC--2018-06-03T20-33-08.306Z--9eceefdf3554e178a6549006f2c02163e63c9fd8';
  }

  toV3String() {
    return JSON.stringify(this.toV3());
  }

  recover() {
    return this.getAddress();
  }

  toV3() {
    return {
      version: 3,
      id: '70534c78-ceb7-4e7e-b805-106504a880c9',
      address: '9eceefdf3554e178a6549006f2c02163e63c9fd8',
      crypto: {
        ciphertext:
          '73041b43d5952ab3177282b8c3df935b60c99c7fc13c77bc602d6be9b421ea2d',
        cipherparams: { iv: 'acb168461a9850642c2b490cf4ed29eb' },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          salt:
            '14770d04f812b80db04b14e6d132e917ff2047aa814c3a9b103f7d4849a48a2c',
          n: 262144,
          r: 8,
          p: 1,
        },
        mac: '4543eebe2f1ca245547be1bba36b7107f13b8e44ef166c7bf7452b4a4461ed4e',
      },
    };
  }
}

export default new EthereumWalletMock();
