import { v3, hdv3 } from 'fixtures/accounts';

const { v3KeystoreValidator } = require.requireActual('@/schema');

describe('validateNonEmptyAccount', () => {
  it('should validateHdAccount', () => {
    [v3, hdv3].forEach(data => {
      const result = v3KeystoreValidator.validateNonEmptyAccountWithInfo(data);
      expect(result).toEqual(data);
    });

    expect(() =>
      v3KeystoreValidator.validateNonEmptyAccountWithInfo({}),
    ).toThrow();
  });
});
