export const cryptoDataBalance = {
  type: 'object',
  required: ['balance', 'tokens'],
  tokens: {
    type: 'array',
    items: {
      type: 'object',
      required: ['name', 'symbol', 'address'],
      properties: {
        address: {
          type: 'string',
          pattern: '^0x[0-9A-Fa-f]+$',
        },
        name: {
          type: 'string',
          minLength: 1,
        },
        symbol: {
          type: 'string',
          minLength: 1,
        },
        balance: {
          type: 'string',
          pattern: '[0-9]+',
          default: '0',
        },
        price: {
          type: 'boolean',
          default: false,
        },
      },
    },
  },
};
