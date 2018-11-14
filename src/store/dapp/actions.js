import Web3Dapp from 'web3-dapp';
import web3 from '@/utils/web3';
import { dappBridge, NotificationError } from '@/class';
import InpageProvider from '@/class/provider/InpageProvider';
import { DAPP_WHITELISTED_METHODS } from '@/constants';
import {
  ADD_REQUEST,
  REMOVE_REQUEST,
  CHANGE_INJECT_STATUS,
} from './mutations-types';

const inject = ({ state, commit, dispatch }, dappWindow) => {
  if (state.injected) return;

  const inpageProvider = new InpageProvider(dappBridge);

  commit(CHANGE_INJECT_STATUS, true);
  dispatch('sendSettings');
  dappBridge.setRequestHandler(payload => dispatch('handleRequest', payload));

  Object.assign(dappWindow, {
    web3: new Web3Dapp(inpageProvider),
  });
};

const reset = ({ commit }) => {
  commit(CHANGE_INJECT_STATUS, false);
};

const handleRequest = async ({ dispatch, commit }, { id, ...request }) => {
  if (DAPP_WHITELISTED_METHODS.includes(request.method)) {
    commit(ADD_REQUEST, {
      id,
      request,
    });
  } else {
    const res = await dispatch('sendRequestToNetwork', {
      ...request,
      id,
    });

    if (res) {
      await dispatch('sendResponse', {
        ...res,
        id,
      });
    }
  }
};

const sendSettings = ({ rootGetters }) => {
  dappBridge.emitSettings({
    selectedAddress: rootGetters['accounts/currentAddressString'].toLowerCase(),
    networkVersion: rootGetters['web3/activeNetwork'],
  });
};

const sendResponse = (ctx, payload) => {
  dappBridge.emitResponse(payload);
};

const processCurrentRequest = async (
  { commit, dispatch, getters },
  password,
) => {
  const requestId = getters.currentRequestId;

  if (!requestId) return;

  const { jsonrpc } = getters.currentRequest;

  try {
    const signResult = await dispatch('getSignedCurrentRequest', password);

    dispatch('sendResponse', {
      id: requestId,
      result: signResult,
      jsonrpc,
    });
  } catch (err) {
    const notificationError = new NotificationError({
      title: 'Sign error',
      text: err.request,
      type: 'is-danger',
    });

    dispatch('errors/emitError', notificationError, { root: true });
    dispatch('sendResponse', {
      id: requestId,
      error: err,
      result: [],
      jsonrpc,
    });
  } finally {
    commit(REMOVE_REQUEST, requestId);
  }
};

const getSignedCurrentRequest = ({ dispatch, getters }, password) => {
  const { method } = getters.currentRequest;

  switch (method) {
    case 'eth_sendTransaction':
      return dispatch('getSignedCurrentTransaction', password);
    case 'eth_signTypedData':
      return dispatch('getSignedCurrentTypedDataRequest', password);
    default:
      return dispatch('getSignedCurrentPlainRequest', password);
  }
};

const getSignedCurrentTransaction = async (
  { dispatch, getters, rootState },
  password,
) => {
  const { wallet } = rootState.accounts;
  const request = getters.currentRequest;
  const nonce = await dispatch('transactions/getNextNonce', null, {
    root: true,
  });
  const signedTx = await wallet.signTransaction(
    {
      ...request.transaction,
      nonce,
    },
    password,
  );

  return new Promise((resolve, reject) => {
    const sendEvent = web3.eth.sendSignedTransaction(signedTx);

    sendEvent.then(receipt => resolve(receipt.transactionHash));

    sendEvent.on('error', error => reject(error));
  });
};

const getSignedCurrentTypedDataRequest = async (
  { getters, rootState },
  password,
) => {
  // const { wallet } = rootState.accounts;
  // const request = getters.currentRequest;

  throw new Error('Sign typed data not supported yet!');
};

const getSignedCurrentPlainRequest = async (
  { getters, rootState },
  password,
) => {
  const { wallet } = rootState.accounts;
  const request = getters.currentRequest;
  const res = await wallet.sign(request.params[0], password);

  return res.signature;
};

const sendRequestToNetwork = (ctx, request) =>
  new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(request, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res);
    });
  });

const cancelCurrentRequest = ({ commit, dispatch, getters }) => {
  const requestId = getters.currentRequestId;

  if (!requestId) return;

  dispatch('sendResponse', {
    id: requestId,
    error: 'canceled',
    result: [],
  });
  commit(REMOVE_REQUEST, requestId);
};

export default {
  inject,
  reset,
  handleRequest,
  sendSettings,
  sendResponse,
  processCurrentRequest,
  getSignedCurrentRequest,
  getSignedCurrentTransaction,
  getSignedCurrentTypedDataRequest,
  getSignedCurrentPlainRequest,
  sendRequestToNetwork,
  cancelCurrentRequest,
};
