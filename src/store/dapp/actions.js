import { dappBridge } from '@/class';
import { INPAGE_EVENT, DAPP_WHITELISTED_METHODS } from '@/constants';
import {
  CHANGE_INIT_STATUS,
  ADD_TRANSACTION,
  REMOVE_TRANSACTION,
} from './mutations-types';

const attach = ({ state, commit }) => {
  if (!state.inited) {
    dappBridge.on(INPAGE_EVENT.REQUEST, payload => {
      if (DAPP_WHITELISTED_METHODS.includes(payload.methd)) {
        commit(ADD_TRANSACTION, payload);
      }
    });

    commit(CHANGE_INIT_STATUS, true);
  }

  window.endpassDappBridge = dappBridge;
};

const detach = () => {
  window.endpassDappBridge = undefined;
};

const sendSettings = (ctx, payload) => {
  dappBridge.emit(INPAGE_EVENT.SETTINGS, payload);
};

const sendResponse = ({ commit }, payload) => {
  console.log('response', payload);
  // dappBridge.emit(INPAGE_EVENT.RESPONSE, payload);
  // commit(REMOVE_TRANSACTION, payload);
};

const cancelTransaction = ({ commit }, payload) => {
  console.log('cancel', payload);
};

export default {
  attach,
  detach,
  sendSettings,
  sendResponse,
  cancelTransaction,
};
