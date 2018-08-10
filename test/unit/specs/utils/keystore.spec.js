import keystore from '@/utils/keystore';
import { kdfParams } from '@/config';

describe('keystore', () => {
  // Extended keys to ecnrypt and decrypt
  let xPrvString =
    'xprv9s21ZrQH143K3DAahVuXkkfZxprW7emgvd19zzSEb2zBxR9mWnMFtzGCwmYCq8YQh21ZqFAcPWtWJXz9sbEXaN9LUSe2cjsw9LkAtwmoWsc';
  let xPubString =
    'xpub661MyMwAqRbcFhF3oXSY7tcJWrgzX7VYHqvkoNqr9NXAqDUv4KfWSnago4BMD4yty2cX6f6jLeQefve3nKriVY6c18NLzCmHdKqWeN8VHkJ';

  let password = 'password123';

  it('encrypts and decrypts an extended key', () => {
    let xPrv = keystore.decodeBase58(xPrvString);
    expect(xPrv.length).toBe(78);

    let json = keystore.encrypt(password, xPrv);
    expect(json.address).toBeUndefined();
    expect(json.crypto.ciphertext).toBeTruthy();
    expect(json.crypto.kdfparams.n).toBe(kdfParams.n);

    let xPrvOut = keystore.decrypt(password, json);
    expect(xPrvOut.length).toBe(78);

    let xPrvOutString = keystore.encodeBase58(xPrv);
    expect(xPrvOutString).toBe(xPrvString);
  });
});
