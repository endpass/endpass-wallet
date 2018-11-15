import {
  ADD_REQUEST,
  REMOVE_REQUEST,
  CHANGE_INJECT_STATUS,
} from './mutations-types';

const changeInitStatus = (state, status) => {
  state.injected = status;
};

const addRequest = (state, { id, request }) => {
  Object.assign(state.requests, {
    [id]: request,
  });
  state.list.push(id);
};

const removeRequest = (state, id) => {
  const requestIdx = state.list.findIndex(requestId => requestId === id);

  if (requestIdx !== -1) {
    state.list.splice(requestIdx, 1);
  }
};

export default {
  [ADD_REQUEST]: addRequest,
  [REMOVE_REQUEST]: removeRequest,
  [CHANGE_INJECT_STATUS]: changeInitStatus,
};
