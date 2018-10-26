import web3, { createWeb3Instance } from '@/utils/web3';
import { hexToMsg } from '@/utils/hex';
import { dappBridge } from '@/class';
import InpageProvider from '@/class/provider/InpageProvider';
import { INPAGE_EVENT, DAPP_WHITELISTED_METHODS } from '@/constants';
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
    selectedAddress: rootGetters['accounts/currentAddressString'],
    networkVersion: rootGetters['web3/activeNetwork'],
  });

  Object.assign(dappWindow, {
    web3: createWeb3Instance(inpageProvider),
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
      jsonrpc: '2.0',
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
    console.log('sign transaction', request);
    // const { wallet } = rootState.accounts;
    // const nonce = await dispatch('transactions/getNextNonce', null, {
    //   root: true,
    // });
    // const signedRequest = await wallet.signTransaction(
    //   Object.assign(request, {
    //     nonce,
    //   }).getApiObject(web3.eth),
    //   password,
    // );

    // console.log('transaction', signedRequest)
  } else {
    const currentAddress = rootGetters['accounts/currentAddressString'];
    const [data, address] = request.params;

    if (currentAddress === web3.utils.toChecksumAddress(address)) {
      const res = await wallet.sign(hexToMsg(data), password);

      dispatch('sendResponse', {
        id: requestId,
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
