import keythereum from 'keythereum';
import bs58check from 'bs58check';
import EthWallet from 'ethereumjs-wallet';
import HDKey from 'ethereumjs-wallet/hdkey';

// Monkey patch keythereum to skip generating address for private keys
// This allows us to encrypt private keys of arbitrary length, and
// conforms better to the Ethereum keystore V3 spec, which does not include
// the address for privacy reasons.
// See https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition#alterations-from-version-1
keythereum.privateKeyToAddress = function(pk) {
  return '';
};

export default {
  // Encrypts a private key Buffer into a V3 keystore object
  // The exported keystore does NOT include an address
  encrypt(password, privateKey) {
    // Generate random salt and iv for each encryption
    let dk = keythereum.create();
    let options = {
      kdf: env.kdfParams.kdf,
      kdfparams: env.kdfParams,
    };
    let encrypted = keythereum.dump(
      password,
      privateKey,
      dk.salt,
      dk.iv,
      options,
    );
    delete encrypted.address;
    return encrypted;
  },

  // Decrypts a V3 keystore object into a private key Buffer
  decrypt(password, json) {
    if (!password) {
      throw new Error('Password is empty');
    }
    if (!this.isV3(json)) {
      throw new Error('Wallet is not in keystore V3 format!');
    }
    return keythereum.recover(password, json);
  },

  // Encrypts an ethereumjs Wallet
  encryptWallet(password, wallet) {
    let json = this.encrypt(password, wallet.getPrivateKey());
    json.address = wallet.getChecksumAddressString();
    return json;
  },

  // Decrypts a keystore into an ethereumjs Wallet
  decryptWallet(password, json) {
    let privateKey = this.decrypt(password, json);
    return EthWallet.fromPrivateKey(privateKey);
  },

  // Encrypts an ethereumjs Wallet
  encryptHDWallet(password, wallet) {
    let xPrv = this.decodeBase58(wallet.privateExtendedKey());
    let json = this.encrypt(password, xPrv);
    json.address = wallet.publicExtendedKey();
    return json;
  },

  // Decrypts a keystore into an ethereumjs Wallet
  decryptHDWallet(password, json) {
    let xPrv = this.decrypt(password, json);
    let xPrvString = this.encodeBase58(xPrv);
    return HDKey.fromExtendedKey(xPrvString);
  },

  // Encode a buffer to Base58Check
  // If already a string, silently return it
  encodeBase58(key) {
    if (typeof key === 'string') {
      return key;
    }
    return bs58check.encode(key);
  },

  // Decode from Base58Check string
  // If not a string, silently return it
  decodeBase58(key) {
    if (typeof key !== 'string') {
      return key;
    }
    return bs58check.decode(key);
  },

  // Returns true if the key is an extended public key (xpub)
  // Accepts string or buffer
  isExtendedPublicKey(key) {
    let keyString = this.encodeBase58(key);
    return keyString.slice(0, 4) === 'xpub';
  },

  // Returns true if the key is an extended private key (xprv)
  // Accepts string or buffer
  isExtendedPrivateKey(key) {
    let keyString = this.encodeBase58(key);
    return keyString.slice(0, 4) === 'xprv';
  },

  // Simple sanity check to ensure a valid V3 keystore
  isV3(json) {
    return json && json.crypto && json.crypto.ciphertext;
  },
};
