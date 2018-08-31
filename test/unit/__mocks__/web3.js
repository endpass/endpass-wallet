import Web3 from 'web3';

jest.mock('web3', () => {
  const originalWeb3 = require.requireActual('web3');
  const setProvider = jest.fn(() => true);
  const currentProvider = {
    destroy: jest.fn(),
    send: jest.fn(),
    sendAsync: jest.fn(),
  };
  const contract = {
    methods: {
      balanceOf(address) {
        return {
          call: jest.fn(),
        };
      },
    },
  };
  const eth = {
    net: {
      getNetworkType: jest.fn().mockResolvedValue('ropsten'),
      getId: jest.fn().mockResolvedValue(3),
    },
    accounts: {},
    Contract: jest.fn(() => contract),
  };

  const utils = originalWeb3.utils;

  const mockWeb3 = jest.fn(() => ({
    setProvider,
    currentProvider,
    eth,
    utils,
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
  mockWeb3.currentProvider = currentProvider;
  mockWeb3.eth = eth;
  mockWeb3.utils = utils;

  return mockWeb3;
});

export default Web3;
