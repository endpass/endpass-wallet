import { tokens } from 'fixtures/tokens';

export default {
  getTokensList() {
    return jest.fn().mockResolvedValue(tokens);
  },
};
