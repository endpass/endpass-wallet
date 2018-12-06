import { ajv } from '@/class/singleton';

const symbolRegex = '^[A-Z]*$';

const gasPriceSchema = {
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

const symbolPriceSchema = {
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

const symbolsPriceSchema = {
  patternProperties: {
    [symbolRegex]: {
      ...symbolPriceSchema,
    },
  },
  propertyNames: {
    pattern: symbolRegex,
  },
};

export default {
  validateGasPrice: ajv.compile(gasPriceSchema),
  validateSymbolPrice: ajv.compile(symbolPriceSchema),
  validateSymbolsPrice: ajv.compile(symbolsPriceSchema),
};
