import {
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  CHANGE_INJECT_STATUS,
} from './mutations-types';

const changeInitStatus = (state, status) => {
  state.injected = status;
};

const addMessage = (state, { id, message }) => {
  Object.assign(state.messages, {
    [id]: message,
  });
  state.list.push(id);
};

const removeMessage = (state, id) => {
  const messageIdx = state.list.findIndex(messageId => messageId === id);

  if (messageIdx !== -1) {
    state.list.splice(messageIdx, 1);
  }
};

export default {
  [ADD_MESSAGE]: addMessage,
  [REMOVE_MESSAGE]: removeMessage,
  [CHANGE_INJECT_STATUS]: changeInitStatus,
};
