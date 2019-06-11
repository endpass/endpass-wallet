import { token } from './tokens';

export const transaction = {
  type: 'object',
  required: ['timestamp', 'from', 'to', 'hash', 'value', 'data'],
  properties: {
    data: {
      type: 'string',
      pattern: '^0x([a-fA-F0-9]+)?$',
    },
    from: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{40,}$',
    },
    hash: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{64,}$',
    },
    timestamp: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]+$',
    },
    to: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{40,}$',
    },
    token: {
      oneOf: [{ type: 'null' }, token],
    },
    value: {
      type: 'string',
      pattern: '^[0-9]*(.[0-9]{1,18})?$',
    },
  },
};

export const transactions = {
  type: 'array',
  items: transaction,
};

export const pendingTransactions = {
  type: 'object',
  additionalProperties: false,
  required: ['filterId', 'transactions'],
  properties: {
    filterId: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]+$',
    },
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['hash', 'from', 'to', 'value', 'gas', 'input', 'timestamp'],
        properties: {
          hash: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{64,}$',
          },
          from: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40,}$',
          },
          to: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40,}$',
          },
          value: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]+$',
          },
          timestamp: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]+$',
          },
          gas: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]+$',
          },
          gasPrice: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]+$',
          },
          input: {
            type: 'string',
            pattern: '^0x([a-fA-F0-9]+)?$',
          },
          chainId: {
            oneOf: [
              { type: 'null' },
              {
                type: 'string',
                pattern: '^0x[a-fA-F0-9]+$',
              },
            ],
          },
        },
      },
    },
  },
};

export default {
  transaction,
  transactions,
  pendingTransactions,
};
