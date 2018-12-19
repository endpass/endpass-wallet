import Web3 from 'web3';

jest.mock('web3', () => {
  class Contract {
    constructor(abi, address) {
      this.address = address;
      this.abi = abi;
    }
  }

  const originalWeb3 = require.requireActual('web3');
  const { transactionHash } = require('fixtures/transactions');
  const setProvider = jest.fn(() => true);
  const currentProvider = {
    destroy: jest.fn(),
    send: jest.fn(),
    sendAsync: jest.fn(),
  };
  const sendEvent = {
    on: jest.fn(),
    then: jest.fn(cb =>
      cb({
        transactionHash,
      }),
    ),
  };
  let subscriptions = {};
  const subscriptionEventEmiter = {
    on: jest.fn((type, callback) => {
      if (!subscriptions[type]) {
        subscriptions[type] = [];
      }

      subscriptions[type].push(callback);

      return subscriptionEventEmiter;
    }),
    emit: jest.fn((type, data) => {
      if (!subscriptions[type]) {
        return;
      }

      subscriptions[type].forEach(callback => callback(data));

      return subscriptionEventEmiter;
    }),
  };
  const subscribe = jest.fn(() => subscriptionEventEmiter);
  const clearSubscriptions = jest.fn(() => (subscriptions = {}));
  const eth = {
    net: {
      getNetworkType: jest.fn().mockResolvedValue('ropsten'),
      getId: jest.fn().mockResolvedValue(3),
    },
    estimateGas: jest.fn(),
    accounts: {},
    Contract,
    sendSignedTransaction: jest.fn(() => sendEvent),
    getBalance: jest.fn().mockResolvedValue('1'),
    getBlockNumber: jest.fn().mockResolvedValue(),
    getBlock: jest.fn().mockResolvedValue({}),
    getTransactionCount: jest.fn().mockResolvedValue(),
    getCode: jest.fn().mockResolvedValue('0x0123'),
    subscribe,
    clearSubscriptions,
    subscriptionEventEmiter,
  };
  const { utils } = originalWeb3;
  const mockWeb3 = jest.fn(() => ({
    setProvider,
    currentProvider,
    eth,
    utils,
    sendEvent,
  }));

  mockWeb3.providers = {
    HttpProvider: jest.fn(() => ({
      prototype: {
        send: jest.fn(),
        sendAsync: jest.fn(),
      },
    })),
    WebsocketProvider: jest.fn(() => ({
      prototype: {
        send: jest.fn(),
        sendAsync: jest.fn(),
      },
    })),
    IpcProvider: jest.fn(() => ({
      prototype: {
        send: jest.fn(),
        sendAsync: jest.fn(),
      },
    })),
  };

  // Allows you to replace stubs of web3 instance methods in unit tests
  mockWeb3.setProvider = setProvider;
  mockWeb3.sendEvent = sendEvent;
  mockWeb3.currentProvider = currentProvider;
  mockWeb3.eth = eth;
  mockWeb3.utils = utils;

  return mockWeb3;
});

export default Web3;
