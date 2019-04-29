const symbolRegex = '^.+$';

export const symbolPrice = {
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

export const symbolsPrices = {
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

export default {
  symbolPrice,
  symbolsPrices,
};
