import { stripHexPrefix } from '@/utils/hex';

describe('stripHexPrefix', () => {
  it('should returns hex without 0x', () => {
    expect(stripHexPrefix('0x0000')).toBe('0000');
  });

  it('should do not anything if given string not contains 0x prefix', () => {
    expect(stripHexPrefix('0000')).toBe('0000');
  });
});
