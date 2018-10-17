import keystore from '@/utils/keystore';
import EthWallet from 'ethereumjs-wallet';
import HDKey from 'ethereumjs-wallet/hdkey';
import env from '../../../../config/test.env';

describe('keystore', () => {
  // Extended keys
  const xPrvString =
    'xprv9s21ZrQH143K3DAahVuXkkfZxprW7emgvd19zzSEb2zBxR9mWnMFtzGCwmYCq8YQh21ZqFAcPWtWJXz9sbEXaN9LUSe2cjsw9LkAtwmoWsc';
  const xPubString =
    'xpub661MyMwAqRbcFhF3oXSY7tcJWrgzX7VYHqvkoNqr9NXAqDUv4KfWSnago4BMD4yty2cX6f6jLeQefve3nKriVY6c18NLzCmHdKqWeN8VHkJ';
  const privateKey =
    'efca4cdd31923b50f4214af5d2ae10e7ac45a5019e9431cc195482d707485378';
  const address = '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c';

  const password = 'password123';

  it('encrypts and decrypts an extended key', () => {
    let xPrv = keystore.decodeBase58(xPrvString);
    expect(xPrv.length).toBe(78);

    let json = keystore.encrypt(password, xPrv);
    console.log(json, json.crypto);
    expect(json.address).toBeUndefined();
    expect(json.crypto.ciphertext).toBeTruthy();
    expect(json.crypto.kdfparams.n).toBe(ENV.kdfParams.n);

    let xPrvOut = keystore.decrypt(password, json);
    expect(xPrvOut.length).toBe(78);

    let xPrvOutString = keystore.encodeBase58(xPrv);
    expect(xPrvOutString).toBe(xPrvString);
  });

  it('encrypts and decrypts a regular wallet', () => {
    let wallet = EthWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    let json = keystore.encryptWallet(password, wallet);
    expect(json.crypto).toBeTruthy();
    expect(json.address).toBe(address);

    let decryptedWallet = keystore.decryptWallet(password, json);
    expect(decryptedWallet.getPrivateKeyString()).toEqual('0x' + privateKey);
  });

  it('encrypts and decrypts an HD wallet', () => {
    let wallet = HDKey.fromExtendedKey(xPrvString);
    let json = keystore.encryptHDWallet(password, wallet);
    expect(json.crypto).toBeTruthy();
    expect(json.address).toBe(xPubString);

    let decryptedWallet = keystore.decryptHDWallet(password, json);
    expect(decryptedWallet.privateExtendedKey()).toEqual(xPrvString);
  });

  it('detects an extended public key', () => {
    let xPub = keystore.decodeBase58(xPubString);
    expect(keystore.isExtendedPublicKey(xPubString)).toBeTruthy();
    expect(keystore.isExtendedPublicKey(xPrvString)).toBeFalsy();
    expect(keystore.isExtendedPublicKey(xPub)).toBeTruthy();
  });

  it('detects an extended private key', () => {
    let xPrv = keystore.decodeBase58(xPrvString);
    expect(keystore.isExtendedPrivateKey(xPrvString)).toBeTruthy();
    expect(keystore.isExtendedPrivateKey(xPubString)).toBeFalsy();
    expect(keystore.isExtendedPrivateKey(xPrv)).toBeTruthy();
  });

  it('detects an invalid v3 wallet', () => {
    expect(keystore.isV3({})).toBeFalsy();
  });
});
