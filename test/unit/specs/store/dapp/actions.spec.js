import actions from '@/store/dapp/actions';
import {
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  CHANGE_INJECT_STATUS,
} from '@/store/dapp/mutations-types';
import { MAIN_NET_ID } from '@/constants';
import { NotificationError } from '@/class';
import web3 from '@/utils/web3';
import dappBridge from '@/class/dappBridge';
import { checksumAddress, v3password } from 'fixtures/accounts';
import {
  commonMessage,
  transactionMessage,
  signedCommonMessage,
  signedTransactionMessage,
} from 'fixtures/dapp';
import { transactionHash, signedTransactionHash } from 'fixtures/transactions';

describe('dapp actions', () => {
  const defaultState = {
    injected: true,
    messages: {
      1: commonMessage,
      2: transactionMessage,
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
      'accounts/currentAddressString': checksumAddress,
      'web3/activeNetwork': MAIN_NET_ID,
    };
    rootState = {
      accounts: {
        wallet: {
          sign: jest.fn().mockResolvedValue(signedCommonMessage),
          signTransaction: jest.fn(() => signedTransactionHash),
        },
      },
    };
    getters = {
      currentMessageId: 1,
      currentMessage: commonMessage,
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
      expect(dappBridge.setMessageHandler).toBeCalled();
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

  describe('handleMessage', () => {
    it('should add message to store if it method is whitelisted', async () => {
      expect.assertions(2);

      actions.handleMessage(
        { dispatch, commit },
        { id: 1, ...transactionMessage },
      );

      expect(dispatch).not.toBeCalled();
      expect(commit).toBeCalledWith(ADD_MESSAGE, {
        id: 1,
        message: transactionMessage,
      });
    });

    it('should send message to the network if it method is not whitelisted', async () => {
      expect.assertions(4);

      dispatch.mockImplementationOnce(() => Promise.resolve({ foo: 'bar' }));

      await actions.handleMessage(
        { dispatch, commit },
        { id: 1, ...commonMessage },
      );

      expect(commit).not.toBeCalled();
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'sendMessageToNetwork', {
        ...commonMessage,
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
      actions.sendSettings({ rootGetters });

      expect(dappBridge.emitSettings).toBeCalledWith({
        selectedAddress: checksumAddress.toLowerCase(),
        networkVersion: MAIN_NET_ID,
      });
    });
  });

  describe('sendResponse', () => {
    it('should emit response by dappBridge', () => {
      actions.sendResponse(null, commonMessage);

      expect(dappBridge.emitResponse).toBeCalledWith(commonMessage);
    });
  });

  describe('processCurrentMessage', () => {
    it('should process current message and send response', async () => {
      expect.assertions(4);

      dispatch.mockResolvedValueOnce(signedCommonMessage);

      await actions.processCurrentMessage(
        { commit, dispatch, getters },
        v3password,
      );

      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'signCurrentMessage',
        v3password,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'sendResponse', {
        ...signedCommonMessage,
        id: 1,
      });
      expect(commit).toBeCalledWith(REMOVE_MESSAGE, 1);
    });

    it('should process current transaction and send response', async () => {
      expect.assertions(4);

      dispatch.mockResolvedValueOnce(signedTransactionMessage);

      getters = {
        currentMessageId: 2,
        currentMessage: transactionMessage,
      };

      await actions.processCurrentMessage(
        { commit, dispatch, getters },
        v3password,
      );

      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'signCurrentTransaction',
        v3password,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'sendResponse', {
        ...signedTransactionMessage,
        id: 2,
      });
      expect(commit).toBeCalledWith(REMOVE_MESSAGE, 2);
    });

    it('should handler error and show notification', async () => {
      expect.assertions(5);

      const error = new Error('foo');

      dispatch.mockRejectedValueOnce(error);

      await actions.processCurrentMessage(
        { commit, dispatch, getters },
        v3password,
      );

      expect(dispatch).toBeCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'signCurrentMessage',
        v3password,
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'errors/emitError',
        expect.any(NotificationError),
        { root: true },
      );
      expect(dispatch).toHaveBeenNthCalledWith(3, 'sendResponse', {
        id: 1,
        jsonrpc: '2.0',
        result: [],
        error,
      });
      expect(commit).toBeCalledWith(REMOVE_MESSAGE, 1);
    });

    it('should not do anything if there is no current message', async () => {
      getters.currentMessageId = null;

      await actions.processCurrentMessage(
        { commit, dispatch, getters },
        v3password,
      );

      expect(commit).not.toBeCalled();
      expect(dispatch).not.toBeCalled();
    });
  });

  describe('signCurrentTransaction', () => {
    it('should sign current transaction with wallet', async () => {
      expect.assertions(5);

      getters = {
        currentMessageId: 2,
        currentMessage: transactionMessage,
      };
      dispatch.mockResolvedValueOnce(1);

      const res = await actions.signCurrentTransaction(
        {
          dispatch,
          getters,
          rootState,
        },
        v3password,
      );

      expect(dispatch).toBeCalledWith('transactions/getNextNonce', null, {
        root: true,
      });
      expect(rootState.accounts.wallet.signTransaction).toBeCalledWith(
        {
          ...transactionMessage.transaction,
          nonce: 1,
        },
        v3password,
      );
      expect(web3.eth.sendSignedTransaction).toBeCalledWith(
        signedTransactionHash,
      );
      expect(web3.sendEvent.on).toBeCalledWith('error', expect.any(Function));
      expect(res).toEqual({
        jsonrpc: commonMessage.jsonrpc,
        result: transactionHash,
      });
    });
  });

  describe('signCurrentMessage', () => {
    it('should sign current message and return result', async () => {
      expect.assertions(2);

      const res = await actions.signCurrentMessage(
        { getters, rootState },
        v3password,
      );

      expect(rootState.accounts.wallet.sign).toBeCalledWith(
        commonMessage.params[0],
        v3password,
      );
      expect(res).toEqual({
        jsonrpc: commonMessage.jsonrpc,
        result: signedCommonMessage.signature,
      });
    });
  });

  describe('sendMessageToNetwork', () => {
    it('should send message with web3 sendAsync method', () => {
      actions.sendMessageToNetwork(null, commonMessage);

      expect(web3.currentProvider.sendAsync).toBeCalledWith(
        commonMessage,
        expect.any(Function),
      );
    });
  });

  describe('cancelCurrentMessage', () => {
    it('should send cancel response by dapp bridge and remove message from store', () => {
      actions.cancelCurrentMessage({ commit, dispatch, getters });

      expect(dispatch).toBeCalledWith('sendResponse', {
        id: 1,
        error: 'canceled',
        result: [],
      });
      expect(commit).toBeCalledWith(REMOVE_MESSAGE, 1);
    });

    it('should not do anything if there is no current message', () => {
      getters.currentMessageId = null;

      actions.cancelCurrentMessage({ commit, dispatch, getters });

      expect(dispatch).not.toBeCalled();
      expect(commit).not.toBeCalled();
    });
  });
});
