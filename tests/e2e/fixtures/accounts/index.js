// Account address
export const address = '0xb14ab53e38da1c172f877dbc6d65e4a1b0474c3c';
export const checksumAddress = '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c';

export const v3password = 'password123';

export const accountsList = [
  'xpub6DojZ5fC8cSLRwc95PFfzUDWUSRod2jSWSbhGKEWFJhoTDiJgRva4am9m7ex1Fm1Ege8MDQ7PNEFqkzdgsRS6UooRfDZpgHkD8vNHiMP3zq',
  '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
  '0x6bBf1DEa0d21eaFd232e281A196E6f11906054df',
];

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
  address: checksumAddress,
};

export const v3Info = {
  address: checksumAddress,
  hidden: false,
  type: 'StandardAccount',
  index: 0,
  label: '',
};

export const v3ExtraInfo = {
  ETH: {
    balance: 0,
  },
  address,
  countTxs: '0x0',
};

// Private key for v3
export const privateKey =
  '0xefca4cdd31923b50f4214af5d2ae10e7ac45a5019e9431cc195482d707485378';

// Encrypted keystore for a normal account
export const v3Import = {
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

export const v3ImportExtraInfo = {
  ETH: {
    balance: 0,
  },
  address: '0x31ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d',
  countTxs: '0x0',
};

// Private key buffer for v3Import
export const privateKeyImport =
  '0x070dc3117300011918e26b02176945cc15c3d548cf49fd8418d97f93af699e46';

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

export const hdv3Info = {
  address:
    'xpub6DojZ5fC8cSLRwc95PFfzUDWUSRod2jSWSbhGKEWFJhoTDiJgRva4am9m7ex1Fm1Ege8MDQ7PNEFqkzdgsRS6UooRfDZpgHkD8vNHiMP3zq',
  hidden: false,
  type: 'HDMainAccount',
  index: 0,
  label: '',
};
