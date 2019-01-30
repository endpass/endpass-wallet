import actions from '@/store/dapp/actions';
import {
  ADD_REQUEST,
  REMOVE_REQUEST,
  CHANGE_INJECT_STATUS,
} from '@/store/dapp/mutations-types';
import { MAIN_NET_ID } from '@/constants';
import web3 from '@/class/singleton/web3';
import dappBridge from '@/class/singleton/dappBridge';
import { checksumAddress, v3password } from 'fixtures/accounts';
import {
  commonRequest,
  transactionRequest,
  commonRequestSignResult,
} from 'fixtures/dapp';
import { transactionHash, signedTransactionHash } from 'fixtures/transactions';

describe('dapp actions', () => {
  const defaultState = {
    injected: true,
    requests: {
      1: commonRequest,
      2: transactionRequest,
    },
    list: [1, 2],
  };
  let dispatch;
  let commit;
  let rootGetters;
  let rootState;
  let state;
  let getters;

  beforeEach(() => {
    dispatch = jest.fn();
    commit = jest.fn();
    rootGetters = {
      'accounts/wallet': {
        sign: jest.fn().mockResolvedValue({
          signature: commonRequestSignResult,
        }),
        signTransaction: jest.fn(() => signedTransactionHash),
      },
      'accounts/currentAddressString': checksumAddress,
      'web3/activeNetwork': MAIN_NET_ID,
    };
    rootState = {
      accounts: {
        address: checksumAddress,
      },
    };
    getters = {
      currentRequestId: 1,
      currentRequest: commonRequest,
    };
    state = {
      ...defaultState,
    };
  });

  describe('inject', () => {
    let fakeWindow;

    beforeEach(() => {
      fakeWindow = {};
    });

    it('should inject web3 to window if it is not injected', () => {
      state = {
        ...defaultState,
        injected: false,
      };

      actions.inject({ state, commit, dispatch }, fakeWindow);

      expect(commit).toHaveBeenCalledWith(CHANGE_INJECT_STATUS, true);
      expect(dispatch).toHaveBeenLastCalledWith('sendSettings');
      expect(fakeWindow.web3).not.toBeUndefined();
      expect(dappBridge.setRequestHandler).toBeCalled();
    });

    it('should not do anything if web3 was injected', () => {
      actions.inject({ state, commit, dispatch }, fakeWindow);

      expect(commit).not.toBeCalled();
      expect(dispatch).not.toBeCalled();
    });
  });

  describe('reset', () => {
    it('should reset web3 injection status ', () => {
      actions.reset({ commit });

      expect(commit).toBeCalledWith(CHANGE_INJECT_STATUS, false);
    });
  });

  describe('handleRequest', () => {
    it('should add request to store if it method is whitelisted', async () => {
      expect.assertions(2);

      actions.handleRequest(
        { dispatch, commit },
        { id: 1, ...transactionRequest },
      );

      expect(dispatch).not.toBeCalled();
      expect(commit).toBeCalledWith(ADD_REQUEST, {
        id: 1,
        request: transactionRequest,
      });
    });

    it('should send request to the network if it method is not whitelisted', async () => {
      expect.assertions(4);

      dispatch.mockImplementationOnce(() => Promise.resolve({ foo: 'bar' }));

      await actions.handleRequest(
        { dispatch, commit },
        { id: 1, ...commonRequest },
      );

      expect(commit).not.toBeCalled();
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'sendRequestToNetwork', {
        ...commonRequest,
        id: 1,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, 'sendResponse', {
        foo: 'bar',
        id: 1,
      });
    });
  });

  describe('sendSettings', () => {
    it('should emit current settings by dappBridge and transform address to lower case', () => {
      actions.sendSettings({ rootState, rootGetters });

      expect(dappBridge.emitSettings).toBeCalledWith({
        selectedAddress: checksumAddress.toLowerCase(),
        networkVersion: MAIN_NET_ID,
      });
    });
  });

  describe('sendResponse', () => {
    it('should emit response by dappBridge', () => {
      actions.sendResponse(null, commonRequest);

      expect(dappBridge.emitResponse).toBeCalledWith(commonRequest);
    });
  });

  describe('processCurrentRequest', () => {
    it('should call getSignedCurrentRequest for signing current request', async () => {
      expect.assertions(2);

      dispatch.mockResolvedValueOnce(commonRequestSignResult);

      await actions.processCurrentRequest(
        { commit, dispatch, getters },
        v3password,
      );

      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'getSignedCurrentRequest',
        v3password,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'sendResponse', {
        jsonrpc: commonRequest.jsonrpc,
        result: commonRequestSignResult,
        id: 1,
      });
    });

    it('should not do anything if there is no current request', async () => {
      getters.currentRequestId = null;

      await actions.processCurrentRequest(
        { commit, dispatch, getters },
        v3password,
      );

      expect(commit).not.toBeCalled();
      expect(dispatch).not.toBeCalled();
    });
  });

  describe('getSignedCurrentRequest', () => {
    it('should sign transaction with getSignedCurrentTransaction', async () => {
      expect.assertions(2);

      getters.currentRequest = {
        ...getters.currentRequest,
        method: 'eth_sendTransaction',
      };

      await actions.getSignedCurrentRequest({ dispatch, getters }, v3password);

      expect(dispatch).toBeCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'getSignedCurrentTransaction',
        v3password,
      );
    });

    it('should sign typed data with getSignedCurrentTypedDataRequest', async () => {
      expect.assertions(2);

      getters.currentRequest = {
        ...getters.currentRequest,
        method: 'eth_signTypedData',
      };

      await actions.getSignedCurrentRequest({ dispatch, getters }, v3password);

      expect(dispatch).toBeCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'getSignedCurrentTypedDataRequest',
        v3password,
      );
    });

    it('should sign other requests with getSignedCurrentPlainRequest', async () => {
      expect.assertions(2);

      await actions.getSignedCurrentRequest({ dispatch, getters }, v3password);

      expect(dispatch).toBeCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'getSignedCurrentPlainRequest',
        v3password,
      );
    });
  });

  describe('getSignedCurrentTransaction', () => {
    it('should sign current transaction with wallet', async () => {
      expect.assertions(5);

      getters = {
        currentRequestId: 2,
        currentRequest: transactionRequest,
      };
      dispatch.mockResolvedValueOnce(1);

      const res = await actions.getSignedCurrentTransaction(
        {
          dispatch,
          getters,
          rootGetters,
        },
        v3password,
      );

      expect(dispatch).toBeCalledWith('transactions/getNextNonce', null, {
        root: true,
      });
      expect(rootGetters['accounts/wallet'].signTransaction).toBeCalledWith(
        {
          ...transactionRequest.transaction,
          nonce: 1,
        },
        v3password,
      );
      expect(web3.eth.sendSignedTransaction).toBeCalledWith(
        signedTransactionHash,
      );
      expect(web3.sendEvent.on).toBeCalledWith('error', expect.any(Function));
      expect(res).toEqual(transactionHash);
    });
  });

  // TODO: now not contains any logic make test when it appears
  // describe('getSignedCurrentTypedDataRequest', () => {})

  describe('getSignedCurrentPlainRequest', () => {
    it('should sign current request and return result', async () => {
      expect.assertions(2);

      const res = await actions.getSignedCurrentPlainRequest(
        { getters, rootGetters },
        v3password,
      );

      expect(rootGetters['accounts/wallet'].sign).toBeCalledWith(
        commonRequest.params[0],
        v3password,
      );
      expect(res).toEqual(commonRequestSignResult);
    });
  });

  describe('sendRequestToNetwork', () => {
    it('should send request with web3 sendAsync method', () => {
      actions.sendRequestToNetwork(null, commonRequest);

      expect(web3.currentProvider.sendAsync).toBeCalledWith(
        commonRequest,
        expect.any(Function),
      );
    });
  });

  describe('cancelCurrentRequest', () => {
    it('should send cancel response by dapp bridge and remove request from store', () => {
      actions.cancelCurrentRequest({ commit, dispatch, getters });

      expect(dispatch).toBeCalledWith('sendResponse', {
        id: 1,
        error: 'canceled',
        result: [],
      });
      expect(commit).toBeCalledWith(REMOVE_REQUEST, 1);
    });

    it('should not do anything if there is no current request', () => {
      getters.currentRequestId = null;

      actions.cancelCurrentRequest({ commit, dispatch, getters });

      expect(dispatch).not.toBeCalled();
      expect(commit).not.toBeCalled();
    });
  });
});
