// eslint-disable-next-line import/prefer-default-export
export const userOtpSetting = {
  oneOf: [
    {
      type: 'object',
      additionalProperties: false,
      required: ['secret'],
      properties: {
        secret: { type: 'string' },
      },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['enabled'],
        },
      },
    },
  ],
};
