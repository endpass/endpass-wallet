export const userToken = {
  type: 'object',
  required: ['address', 'decimals', 'logo', 'name', 'symbol'],
  properties: {
    address: {
      type: 'string',
      pattern: '^0x[0-9A-Fa-f]+$',
    },
    decimals: {
      type: 'integer',
    },
    logo: {
      oneOf: [
        { type: 'string', maxLength: 0 },
        { type: 'string', format: 'url' },
      ],
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    symbol: {
      type: 'string',
      minLength: 1,
    },
    manuallyAdded: {
      type: 'boolean',
    },
    hidden: {
      type: 'boolean',
    },
  },
};

export default {
  userToken,
};
