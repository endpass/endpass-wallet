import { isNil } from 'lodash';

const currentRequestId = state => state.list[0] || null;

const currentRequest = (state, getters) => {
  const nextRequestId = getters.currentRequestId;

  if (isNil(nextRequestId)) return null;

  return state.requests[nextRequestId];
};

export default {
  currentRequestId,
  currentRequest,
};
