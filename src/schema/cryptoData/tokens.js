export const token = {
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
    decimals: {
      type: 'number',
    },
    price: {
      type: 'boolean',
      default: false,
    },
  },
};

export const tokens = {
  type: 'array',
  items: token,
};

export default {
  token,
  tokens,
};
