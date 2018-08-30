import Web3 from 'web3';

jest.mock('web3', () => {
  const originalWeb3 = require.requireActual('web3');
  const setProvider = jest.fn(() => true);
  const currentProvider = {
    destroy: jest.fn(),
  };
  const eth = {
    net: {
      getNetworkType: jest.fn().mockResolvedValue('ropsten'),
      getId: jest.fn().mockResolvedValue(3),
    },
  };
  const mockWeb3 = jest.fn(() => ({
    setProvider,
    currentProvider,
    eth,
  }));

  mockWeb3.providers = {
    HttpProvider: jest.fn(() => ({
      prototype: {
        send: jest.fn(),
      },
    })),
    WebsocketProvider: jest.fn(() => ({
      prototype: {
        send: jest.fn(),
      },
    })),
    IpcProvider: jest.fn(() => ({
      prototype: {
        send: jest.fn(),
      },
    })),
  };

  mockWeb3.utils = originalWeb3.utils;

  // Allows you to replace stubs of web3 instance methods in unit tests
  mockWeb3.setProvider = setProvider;
  mockWeb3.currentProvider = currentProvider;
  mockWeb3.eth = eth;

  return mockWeb3;
});

export default Web3;
