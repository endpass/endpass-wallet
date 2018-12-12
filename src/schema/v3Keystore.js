const address = {
  oneOf: [
    {
      type: 'string',
      pattern: '^0x[0-9A-Fa-f]+$',
    },
    {
      type: 'string',
      pattern: '^xpub[0-9A-Za-z]+$',
    },
  ],
};

const nonEmptyAccount = {
  additionalProperties: false,
  type: 'object',
  required: ['id', 'crypto', 'version', 'address'],
  properties: {
    id: {
      type: 'string',
    },
    crypto: {
      type: 'object',
      required: [
        'cipher',
        'ciphertext',
        'cipherparams',
        'mac',
        'kdf',
        'kdfparams',
      ],
      properties: {
        cipher: {
          type: 'string',
        },
        ciphertext: {
          type: 'string',
        },
        mac: {
          type: 'string',
        },
        kdf: {
          type: 'string',
        },
        kdfparams: {
          type: 'object',
          required: ['dklen', 'n', 'r', 'p', 'salt'],
          properties: {
            dklen: {
              type: 'integer',
            },
            n: {
              type: 'integer',
            },
            r: {
              type: 'integer',
            },
            p: {
              type: 'integer',
            },
            salt: {
              type: 'string',
            },
          },
        },
      },
    },
    version: {
      type: 'integer',
    },
    address,
  },
};

export const account = {
  oneOf: [
    { ...nonEmptyAccount },
    { type: 'object', maxProperties: 0 },
    {
      additionalProperties: false,
      type: 'object',
      required: ['address'],
      properties: {
        address,
      },
    },
  ],
};

export const addresses = {
  type: 'array',
  items: address,
};
