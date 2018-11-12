import { isNil } from 'lodash';
import { TransactionFactory } from '@/class';

const currentMessageId = state => state.list[0] || null;

const currentMessage = (state, getters) => {
  const nextMessageId = getters.currentMessageId;

  if (isNil(nextMessageId)) return null;

  const nextMessage = state.messages[nextMessageId];

  if (nextMessage.method === 'eth_sendTransaction') {
    return Object.assign({}, nextMessage, {
      transaction: TransactionFactory.fromBlock(nextMessage.params[0]),
    });
  }

  return nextMessage;
};

export default {
  currentMessageId,
  currentMessage,
};
