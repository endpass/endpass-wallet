const symbolRegex = '^.+$';

export const gasPrice = {
  type: 'object',
  additionalProperties: false,
  required: ['low', 'medium', 'high'],
  properties: {
    low: {
      type: 'number',
    },
    medium: {
      type: 'number',
    },
    high: {
      type: 'number',
    },
  },
};

const symbolPrice = {
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

export const symbolsPrice = {
  oneOf: [
    symbolPrice,
    {
      type: 'object',
      minProperties: 1,
      patternProperties: {
        [symbolRegex]: symbolPrice,
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
