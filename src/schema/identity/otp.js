export default {
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
