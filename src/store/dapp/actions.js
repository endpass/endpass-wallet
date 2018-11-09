import Web3Dapp from 'web3-dapp';
import web3 from '@/utils/web3';
import { dappBridge } from '@/class';
import InpageProvider from '@/class/provider/InpageProvider';
import { DAPP_WHITELISTED_METHODS } from '@/constants';
import {
  ADD_REQUEST,
  REMOVE_REQUEST,
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

  dappBridge.setRequestHandler(payload => dispatch('handleRequest', payload));
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

const sendSettings = ({ getters }) => {
  dappBridge.emitSettings({
    selectedAddress: getters['accounts/currentAddressString'],
    networkVersion: getters['web3/activeNetwork'],
  });
};

const sendResponse = (ctx, payload) => {
  dappBridge.emitResponse(payload);
};

const processCurrentRequest = async (
  { commit, dispatch, getters, rootState, rootGetters },
  password,
) => {
  const requestId = getters.currentRequestId;
  const request = getters.currentRequest;
  const { wallet } = rootState.accounts;

  if (request.method === 'eth_sendTransaction') {
    const nonce = await dispatch('transactions/getNextNonce', null, {
      root: true,
    });
    const signedTx = await wallet.signTransaction(
      Object.assign({}, request.transaction, {
        nonce,
      }),
      password,
    );
    const promise = web3.eth.sendSignedTransaction(signedTx);
    promise.then(receipt => {
      dispatch('sendResponse', {
        id: requestId,
        jsonrpc: getters.currentRequest.jsonrpc,
        result: receipt.transactionHash,
      });
    });
    promise.on('error', error => {
      dispatch('sendResponse', {
        id: requestId,
        error,
      });
    });
  } else {
    const currentAddress = rootGetters['accounts/currentAddressString'];
    const [data, address] = request.params;

    if (currentAddress === web3.utils.toChecksumAddress(address)) {
      const res = await wallet.sign(data, password);

      dispatch('sendResponse', {
        id: requestId,
        jsonrpc: getters.currentRequest.jsonrpc,
        result: res.signature,
      });
    } else {
      console.log('different address, throwing error');
    }
  }

  commit(REMOVE_REQUEST, requestId);
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

  dispatch('sendResponse', {
    id: requestId,
    error: 'canceled',
    result: {},
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
  sendRequestToNetwork,
  cancelCurrentRequest,
};
