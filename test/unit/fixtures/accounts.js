// List of account addresses
const addresses = [
  'xpub661MyMwAqRbcFhF3oXSY7tcJWrgzX7VYHqvkoNqr9NXAqDUv4KfWSnago4BMD4yty2cX6f6jLeQefve3nKriVY6c18NLzCmHdKqWeN8VHkJ',
  '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
];

const v3password = 'password123';

// Encrypted keystore for a normal account
const v3 = {
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
const hdv3 = {
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

export default {
  addresses,
  v3,
  hdv3,
  v3password,
};
