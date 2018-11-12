import Web3Dapp from 'web3-dapp';
import web3 from '@/utils/web3';
import { dappBridge } from '@/class';
import InpageProvider from '@/class/provider/InpageProvider';
import { DAPP_WHITELISTED_METHODS } from '@/constants';
import {
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  CHANGE_INJECT_STATUS,
} from './mutations-types';

const inject = ({ state, commit, dispatch, rootGetters }, dappWindow) => {
  if (state.injected) return;

  commit(CHANGE_INJECT_STATUS, true);

  const inpageProvider = new InpageProvider(dappBridge);
  inpageProvider.updateSettings({
    selectedAddress: rootGetters['accounts/currentAddressString'].toLowerCase(),
    networkVersion: rootGetters['web3/activeNetwork'],
  });

  Object.assign(dappWindow, {
    web3: new Web3Dapp(inpageProvider),
  });

  dappBridge.setMessageHandler(payload => dispatch('handleMessage', payload));
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

const sendSettings = ({ getters }) => {
  dappBridge.emitSettings({
    selectedAddress: getters['accounts/currentAddressString'],
    networkVersion: getters['web3/activeNetwork'],
  });
};

const sendResponse = (ctx, payload) => {
  dappBridge.emitResponse(payload);
};

const processCurrentMessage = async (
  { commit, dispatch, getters, rootState, rootGetters },
  password,
) => {
  const { wallet } = rootState.accounts;
  const messageId = getters.currentMessageId;
  const message = getters.currentMessage;

  if (message.method === 'eth_sendTransaction') {
    const nonce = await dispatch('transactions/getNextNonce', null, {
      root: true,
    });
    const signedTx = await wallet.signTransaction(
      Object.assign({}, message.transaction, {
        nonce,
      }),
      password,
    );
    const promise = web3.eth.sendSignedTransaction(signedTx);
    promise.then(receipt => {
      dispatch('sendResponse', {
        id: messageId,
        jsonrpc: message.jsonrpc,
        result: receipt.transactionHash,
      });
    });
    promise.on('error', error => {
      dispatch('sendResponse', {
        id: messageId,
        error,
      });
    });
  } else {
    const currentAddress = rootGetters['accounts/currentAddressString'];
    const [data, address] = message.params;

    if (currentAddress === web3.utils.toChecksumAddress(address)) {
      const res = await wallet.sign(data, password);

      dispatch('sendResponse', {
        id: messageId,
        jsonrpc: message.jsonrpc,
        result: res.signature,
      });
    } else {
      console.log('different address, throwing error');
    }
  }

  commit(REMOVE_MESSAGE, messageId);
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
    result: {},
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
  sendMessageToNetwork,
  cancelCurrentMessage,
};
