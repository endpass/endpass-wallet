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

  // Encode to Base58Check
  encodeBase58(key) {
    return bs58check.encode(key);
  },

  // Decode from Base58Check
  decodeBase58(key) {
    return bs58check.decode(key);
  },
};
