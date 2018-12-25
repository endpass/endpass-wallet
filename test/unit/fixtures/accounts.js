// Account address
export const address = '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c';
export const addressHdChild = '0xC2013cAf34b224572B66F4d44313E73D437EB6E3';
export const checksumAddress = '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c';

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

// mnemonic for hdv3
export const mnemonic =
  'seed sock milk update focus rotate barely fade car face mechanic mercy';

// Encrypted keystore for an hd account
export const hdv3 = {
  address:
    'xpub6DojZ5fC8cSLRwc95PFfzUDWUSRod2jSWSbhGKEWFJhoTDiJgRva4am9m7ex1Fm1Ege8MDQ7PNEFqkzdgsRS6UooRfDZpgHkD8vNHiMP3zq',
  crypto: {
    cipher: 'aes-128-ctr',
    cipherparams: { iv: 'b58264d466c90f8924f3a6c13ee64463' },
    ciphertext:
      'fea516b5cf51e6d0b5d5c83fc1673a1f0e2563b4523fb409a655a9d53b1e0055586ff4182fbebf00a52a585f595abd917970ab79f8938e5dc60f841a170af265e77ecca1d20beff845db276f8bbe',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      n: 4,
      p: 8,
      r: 1,
      salt: '951266735f664dc8f0911b8c424d79b285cb962fc0b980b3937f821f912963e2',
    },
    mac: '5e7db9b83ca75c1be99c3587d5dc6882892b3c4556924606eb499da52e38b942',
  },
  id: '26c91dbc-f900-4d7c-8ec5-a9a59c0ecd81',
  version: 3,
};

// Private key buffer for v3
// prettier-ignore
export const privateKey = {"data": [239, 202, 76, 221, 49, 146, 59, 80, 244, 33, 74, 245, 210, 174, 16, 231, 172, 69, 165, 1, 158, 148, 49, 204, 25, 84, 130, 215, 7, 72, 83, 120], "type": "Buffer"};

export const privateKeyString =
  '0xefca4cdd31923b50f4214af5d2ae10e7ac45a5019e9431cc195482d707485378';

export const email = 'user@example.com';

export const settings = {
  id: 'abcd-1234',
  email: 'user@example.com',
  net: 3,
  fiatCurrency: 'USD',
  networks: [
    {
      id: 5,
      name: 'asdfa',
      url: 'https://web3.example.com/rpc',
    },
  ],
  tokens: {
    '3': [
      {
        address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
        decimals: 18,
        logo: '/img/0xe41d2489571d322189246dafa5ebde1f4699f498.png',
        manuallyAdded: true,
        name: '0x Project',
        symbol: 'ZRX',
      },
    ],
  },
};

export const otpSettings = {
  otp: true,
};
