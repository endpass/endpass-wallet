import { pick } from 'lodash';
import web3, { createWeb3Instance } from '@/utils/web3';
import { dappBridge } from '@/class';
import InpageProvider from '@/class/provider/InpageProvider';
import { INPAGE_EVENT } from '@/constants';
// import {
//   CHANGE_INIT_STATUS,
//   ADD_TRANSACTION,
//   REMOVE_TRANSACTION,
// } from './mutations-types';

const inject = ({ dispatch, rootGetters, rootState }, dappWindow) => {
  const inpageProvider = new InpageProvider(dappBridge);

  // TODO: create web3 instance and replace personal methods and properties

  inpageProvider.updateSettings({
    selectedAddress: rootGetters['accounts/currentAddressString'],
    networkVersion: rootGetters['web3/activeNetwork'],
  });

  Object.assign(dappWindow, {
    web3: createWeb3Instance(inpageProvider),
  });

  dappBridge.setRequestHandler(payload => dispatch('handleRequest', payload));
};

const handleRequest = ({ dispatch, rootGetters }, payload) => {
  console.log('request', payload.method);
};

const sendSettings = (ctx, payload) => {
  dappBridge.emitSettings(payload);
};

const sendResponse = ({ commit }, transaction) => {
  dappBridge.emitResponse(transaction);
};

const cancelTransaction = ({ commit }, transaction) => {
  console.log('cancel', transaction);
};

export default {
  inject,
  handleRequest,
  sendSettings,
  sendResponse,
  cancelTransaction,
};
