jest.mock('@/class/singleton/dappBridge', () => ({
  on: jest.fn(),
  emit: jest.fn(),
  setRequestHandler: jest.fn(),
  handleRequest: jest.fn(),
  emitResponse: jest.fn(),
  emitSettings: jest.fn(),
}));
