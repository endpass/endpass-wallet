jest.mock('@/class/dappBridge', () => ({
  on: jest.fn(),
  emit: jest.fn(),
  setMessageHandler: jest.fn(),
  handleMessage: jest.fn(),
  emitResponse: jest.fn(),
  emitSettings: jest.fn(),
}));
