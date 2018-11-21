import { ajv } from '@/class/singleton';

export const gasPriceSchema = {
  properties: {
    low: {
      type: 'number',
      default: 0,
    },
    medium: {
      type: 'number',
      default: 0,
    },
    high: {
      type: 'number',
      default: 0,
    },
  },
};

export default {
  validateGasPrice: ajv.compile(gasPriceSchema),
};
