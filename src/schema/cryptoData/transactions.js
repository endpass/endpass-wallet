import { token } from './tokens';

export const transaction = {
  type: 'object',
  required: ['timestamp', 'from', 'to', 'hash', 'value'],
  properties: {
    data: {
      type: 'string',
      pattern: '^0x[a-zA-Z0-9]?',
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
    token: {
      oneOf: [{ type: 'null' }, token],
    },
    value: {
      type: 'string',
      pattern: '^[0-9]*(.[0-9]{1,18})?',
    },
  },
};

export const transactions = {
  type: 'array',
  items: transaction,
};

export default {
  transaction,
  transactions,
};
