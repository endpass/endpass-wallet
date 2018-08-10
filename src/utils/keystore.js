import keythereum from 'keythereum';
import bs58check from 'bs58check';
import { kdfParams } from '@/config';

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
      kdf: kdfParams.kdf,
      kdfparams: kdfParams,
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
  decrypt(password, keystore) {
    return keythereum.recover(password, keystore);
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
};
