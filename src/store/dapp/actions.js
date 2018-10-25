import { pick, isEqual } from 'lodash';
import keccak from 'keccak';
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

  // TODO: change injected to false on dapp close or leaving page
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

const handleRequest = async ({ dispatch, commit }, { id, ...request }) => {
  if (DAPP_WHITELISTED_METHODS.includes(request.method)) {
    commit(ADD_REQUEST, {
      id,
      request,
    });
  } else {
    const res = await dispatch('sendRequestToNetwork', request);

    if (res) {
      await dispatch('sendResponse', {
        payload: res,
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
      const res1 = await wallet.personalSign(data, password);
      const res2 = await wallet.sign(hexToMsg(data), password);

      console.log(res1, res2);
      console.log(isEqual(JSON.stringify(res1)), isEqual(JSON.stringify(res2)));

      // console.log(res);
      // const ver = await web3.eth.personal.ecRecover(
      //   hexToMsg(data),
      //   res.signature,
      // );

      // console.log('with ecRecov', data, res, ver);

      // dispatch('sendResponse', {
      //   id: requestId,
      //   result: res.signature,
      // });
    } else {
      console.log('different address, throwing error');
    }
  }

  // commit(REMOVE_REQUEST, requestId);
};

// TODO: отправлять только транзакции и запросы, которые не требуют подписи
const sendRequestToNetwork = (ctx, request) => {
  console.log('send', request);
  // new Promise((resolve, reject) => {
  //   web3.currentProvider.sendAsync(request, res => {
  //     console.log(request, res);

  //     return resolve(null);
  //   });
};

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
  handleRequest,
  sendSettings,
  sendResponse,

  processCurrentRequest,
  sendRequestToNetwork,
  cancelCurrentRequest,
};
