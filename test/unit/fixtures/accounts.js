// Account address
export const address = '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c';

// List of account addresses
export const addresses = [
  'xpub661MyMwAqRbcFhF3oXSY7tcJWrgzX7VYHqvkoNqr9NXAqDUv4KfWSnago4BMD4yty2cX6f6jLeQefve3nKriVY6c18NLzCmHdKqWeN8VHkJ',
  '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
];

export const v3password = 'password123';

// Encrypted keystore for a normal account
export const v3 = {
  crypto: {
    cipher: 'aes-128-ctr',
    ciphertext:
      '8c103f3ab6d9afc34171718e1df01c3cc0beac7d3a3c18d9bdc12fd835bca2c3',
    cipherparams: { iv: 'cb0e53ab7f9a59c05e6b8c0567f58992' },
    mac: '05fd3c4d79cab39182f7e0b72c9f1962825fefcf407596f14f14e2398809ac30',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      n: 4,
      r: 1,
      p: 8,
      salt: '091f4ccec76fdba12ffe9ae6c3573d0c90ccc888e3cd7665f81edf03edeb2e4e',
    },
  },
  id: '349f7946-6edd-48af-89ef-01ff3c9c7e3d',
  version: 3,
  address: '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
};

// Encrypted keystore for an hd account
export const hdv3 = {
  crypto: {
    cipher: 'aes-128-ctr',
    ciphertext:
      '85bd8c827099d3e005981bc3e286797c9ec3d727e612b8ba5113043a0fb25b0512c1b01876c021cc8b72214c8629aa5df1af4ebee81ad148be26d264d3c3ba97da3e2f9afba8b3e9e14ed234e20f',
    cipherparams: { iv: '459938f01512646d1f31ff10ebc53942' },
    mac: '404661975cd3421b30fd8ce7e7599a59453be52764806f55468386babb218bc9',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      n: 4,
      r: 1,
      p: 8,
      salt: '0e9ffb54bdaf85c27b52a11f9ab3a404a0c37ba695056e71a3683e39991b01fd',
    },
  },
  id: '8ebd381f-dcc2-4ae8-840a-e62379adea38',
  version: 3,
  address:
    'xpub661MyMwAqRbcFhF3oXSY7tcJWrgzX7VYHqvkoNqr9NXAqDUv4KfWSnago4BMD4yty2cX6f6jLeQefve3nKriVY6c18NLzCmHdKqWeN8VHkJ',
};

// Private key buffer for v3
// prettier-ignore
export const privateKey = {"data": [239, 202, 76, 221, 49, 146, 59, 80, 244, 33, 74, 245, 210, 174, 16, 231, 172, 69, 165, 1, 158, 148, 49, 204, 25, 84, 130, 215, 7, 72, 83, 120], "type": "Buffer"};

export const privateKeyString =
  '0xefca4cdd31923b50f4214af5d2ae10e7ac45a5019e9431cc195482d707485378';

export default {
  address,
  addresses,
  v3,
  hdv3,
  v3password,
  privateKey,
  privateKeyString,
};
