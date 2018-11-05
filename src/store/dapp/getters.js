import { isNil } from 'lodash';
import { Transaction } from '@/class';

const currentRequestId = state => state.list[0] || null;

const currentRequest = (state, getters) => {
  const nextRequestId = getters.currentRequestId;

  if (isNil(nextRequestId)) return null;

  const nextRequest = state.requests[nextRequestId];

  if (nextRequest.method === 'eth_sendTransaction') {
    return Object.assign({}, nextRequest, {
      transaction: new Transaction(nextRequest.params[0]),
    });
  }

  return nextRequest;
};

export default {
  currentRequestId,
  currentRequest,
};
