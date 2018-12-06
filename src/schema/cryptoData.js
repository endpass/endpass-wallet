const symbolRegex = '^.+$';

export const gasPrice = {
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

export const symbolPrice = {
  maxProperties: 1,
  minProperties: 1,
  type: 'object',
  patternProperties: {
    [symbolRegex]: { type: 'number' },
  },
  propertyNames: {
    pattern: symbolRegex,
  },
};

export const symbolsPrice = {
  minProperties: 1,
  patternProperties: {
    [symbolRegex]: {
      ...symbolPrice,
    },
  },
  propertyNames: {
    pattern: symbolRegex,
  },
};
