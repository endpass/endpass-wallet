import { ajv } from '@/class/singleton';

export const gasPriceSchema = {
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

export default {
  validateGasPrice: ajv.compile(gasPriceSchema),
};
