import {
  SET_WEB3_CONNECTION_STATUS,
  SET_API_CONNECTION_STATUS,
  SET_SYNC_STATUS,
  ADD_API_ERROR_ID,
  REMOVE_API_ERROR_ID,
} from './mutations-types';

const setWeb3ConnectionStatus = (state, status) => {
  state.web3Connection = status;
};

const setApiConnectionStatus = (state, status) => {
  state.apiConnection = status;
};

const setSyncStatus = (state, status) => {
  state.isSyncing = status;
};

const addApiErrorId = (state, id) => {
  var index = state.apiErrorsArray.indexOf(id);
  if (index === -1) state.apiErrorsArray.push(id);
};

const removeApiErrorId = (state, id) => {
  var index = state.apiErrorsArray.indexOf(id);
  if (index !== -1) state.apiErrorsArray.splice(index, 1);
};

export default {
  [SET_WEB3_CONNECTION_STATUS]: setWeb3ConnectionStatus,
  [SET_API_CONNECTION_STATUS]: setApiConnectionStatus,
  [SET_SYNC_STATUS]: setSyncStatus,
  [ADD_API_ERROR_ID]: addApiErrorId,
  [REMOVE_API_ERROR_ID]: removeApiErrorId,
};
