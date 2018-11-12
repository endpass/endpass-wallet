import Web3Dapp from 'web3-dapp';
import web3 from '@/utils/web3';
import { dappBridge, NotificationError } from '@/class';
import InpageProvider from '@/class/provider/InpageProvider';
import { DAPP_WHITELISTED_METHODS } from '@/constants';
import {
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  CHANGE_INJECT_STATUS,
} from './mutations-types';

const inject = ({ state, commit, dispatch }, dappWindow) => {
  if (state.injected) return;

  const inpageProvider = new InpageProvider(dappBridge);

  commit(CHANGE_INJECT_STATUS, true);
  dispatch('sendSettings');
  dappBridge.setMessageHandler(payload => dispatch('handleMessage', payload));

  Object.assign(dappWindow, {
    web3: new Web3Dapp(inpageProvider),
  });
};

const reset = ({ commit }) => {
  commit(CHANGE_INJECT_STATUS, false);
};

const handleMessage = async ({ dispatch, commit }, { id, ...message }) => {
  if (DAPP_WHITELISTED_METHODS.includes(message.method)) {
    commit(ADD_MESSAGE, {
      id,
      message,
    });
  } else {
    const res = await dispatch('sendMessageToNetwork', {
      ...message,
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

const processCurrentMessage = async (
  { commit, dispatch, getters },
  password,
) => {
  const messageId = getters.currentMessageId;
  const { method, jsonrpc } = getters.currentMessage;

  try {
    const res =
      method === 'eth_sendTransaction'
        ? await dispatch('signCurrentTransaction', password)
        : await dispatch('signCurrentMessage', password);

    dispatch('sendResponse', {
      ...res,
      id: messageId,
    });
  } catch (err) {
    const notificationError = new NotificationError({
      title: 'Sign error',
      text: err.message,
      type: 'is-danger',
    });

    dispatch('errors/emitError', notificationError, { root: true });
    dispatch('sendResponse', {
      id: messageId,
      error: err,
      result: [],
      jsonrpc,
    });
  } finally {
    commit(REMOVE_MESSAGE, messageId);
  }
};

const signCurrentTransaction = async (
  { dispatch, getters, rootState },
  password,
) => {
  const { wallet } = rootState.accounts;
  const message = getters.currentMessage;
  const nonce = await dispatch('transactions/getNextNonce', null, {
    root: true,
  });
  const signedTx = await wallet.signTransaction(
    Object.assign({}, message.transaction, {
      nonce,
    }),
    password,
  );

  return new Promise((resolve, reject) => {
    const sendEvent = web3.eth.sendSignedTransaction(signedTx);

    sendEvent.then(receipt =>
      resolve({
        jsonrpc: message.jsonrpc,
        result: receipt.transactionHash,
      }),
    );

    sendEvent.on('error', error => reject(error));
  });
};

const signCurrentMessage = async ({ getters, rootState }, password) => {
  const { wallet } = rootState.accounts;
  const message = getters.currentMessage;
  const res = await wallet.sign(message.params[0], password);

  return {
    jsonrpc: message.jsonrpc,
    result: res.signature,
  };
};

const sendMessageToNetwork = (ctx, message) =>
  new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(message, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res);
    });
  });

const cancelCurrentMessage = ({ commit, dispatch, getters }) => {
  const messageId = getters.currentMessageId;

  dispatch('sendResponse', {
    id: messageId,
    error: 'canceled',
    result: [],
  });
  commit(REMOVE_MESSAGE, messageId);
};

export default {
  inject,
  reset,
  handleMessage,
  sendSettings,
  sendResponse,
  processCurrentMessage,
  signCurrentTransaction,
  signCurrentMessage,
  sendMessageToNetwork,
  cancelCurrentMessage,
};
