import { ajv } from '@/class/singleton';

export const gasPriceSchema = {
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
};

export default {
  gasPrice: ajv.compile(gasPriceSchema),
};
