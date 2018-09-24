// Account address
export const address = '0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d';
export const checksumAddress = '0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d';

export const v3password = 'password123';

// Encrypted keystore for a normal account
export const v3 = {
  crypto: {
    cipher: 'aes-128-ctr',
    ciphertext:
      '7cac2d65101c01254fb250dba8187f36c41e6ae3a23c01c3dc570c29e60ef7d4',
    cipherparams: { iv: 'dd4807d2443fcb886bf681f8c22bfaba' },
    mac: 'b90d786c672d8ffeadc14080f951c4f2e96b7952578a807b78cc0498c9bf5147',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      n: 1024,
      r: 1,
      p: 8,
      salt: '77b9ef18416f5bc4f48bdb1de9e9d2d493f868287241c6066d609f92ab8c468e',
    },
  },
  id: '01eb1f7c-a482-4bc5-98ec-8101417b5134',
  version: 3,
  address: '0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d',
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
export const privateKey =
  '0x070dc3117300011918e26b02176945cc15c3d548cf49fd8418d97f93af699e46';
