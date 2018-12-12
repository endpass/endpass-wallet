export default {
  type: 'object',
  required: ['id', 'name', 'url', 'currency'],
  properties: {
    id: {
      type: 'integer',
    },
    name: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    currency: {
      type: 'integer',
    },
  },
};
