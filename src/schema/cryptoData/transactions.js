export const cryptoDataTransaction = {
  type: 'object',
  required: ['timestamp', 'from', 'to', 'hash', 'value'],
  properties: {
    data: {
      type: 'string',
      pattern: '^0x[a-zA-Z0-9]+',
    },
    from: {
      type: 'string',
      pattern: '^0x[a-zA-Z0-9]{40,}',
    },
    hash: {
      type: 'string',
      pattern: '^0x[a-zA-Z0-9]{64,}',
    },
    timestamp: {
      type: 'number',
    },
    to: {
      type: 'string',
      pattern: '^0x[a-zA-Z0-9]{40,}',
    },
    // token: {
    //   type: 'object',
    //   required: ['name', 'symbol'],
    //   properties: {
    //     name: {
    //       type: 'string',
    //     },
    //     symbol: {
    //       type: 'string',
    //     },
    //     decimals: {
    //       type: 'number',
    //       default: 18,
    //     },
    //   },
    // },
    value: {
      type: 'number',
    },
  },
};

export const cryptoDataTransactions = {
  type: 'array',
  items: cryptoDataTransaction,
};
