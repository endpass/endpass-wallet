const symbolRegex = '^.+$';

export const cryptoDataSymbolPrice = {
  type: 'object',
  maxProperties: 1,
  minProperties: 1,
  patternProperties: {
    [symbolRegex]: { type: 'number' },
  },
  propertyNames: {
    pattern: symbolRegex,
  },
};

export const cryptoDataSymbolPrices = {
  oneOf: [
    cryptoDataSymbolPrice,
    {
      type: 'object',
      minProperties: 1,
      patternProperties: {
        [symbolRegex]: cryptoDataSymbolPrice,
      },
      propertyNames: {
        pattern: symbolRegex,
      },
    },
  ],
};

export const pendingTransactions = {
  type: 'object',
  additionalProperties: false,
  required: ['filterId', 'transactions'],
  properties: {
    filterId: {
      type: 'number',
    },
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['hash', 'from', 'to', 'value', 'gas', 'input'],
        properties: {
          hash: {
            type: 'string',
          },
          from: {
            type: 'string',
          },
          to: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          gas: {
            type: 'string',
          },
          input: {
            type: 'string',
          },
        },
      },
    },
  },
};
