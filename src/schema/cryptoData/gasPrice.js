export const cryptoDataGasPrice = {
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
