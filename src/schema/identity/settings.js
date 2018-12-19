import userNetworkSchema from './network';
import userTokenSchema from './token';

export default {
  type: 'object',
  required: ['email', 'fiatCurrency', 'otp_enabled'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    fiatCurrency: {
      type: 'string',
      minLength: 1,
      default: 'USD',
    },
    otp_enabled: {
      type: 'boolean',
    },
    net: {
      type: 'integer',
    },
    networks: {
      type: 'array',
      items: { ...userNetworkSchema },
    },
    tokens: {
      type: 'object',
      propertyNames: { type: 'string' },
      additionalProperties: {
        type: 'array',
        items: { ...userTokenSchema },
      },
    },
  },
};
