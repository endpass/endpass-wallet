import { uniq } from '@/utils/arrays';

describe('arrays utils', () => {
  describe('uniq', () => {
    it('should returns unique array items', () => {
      expect(uniq(['a', 'b', 'a', 'c', 'b', 'b', 'a', 'c'])).toEqual([
        'a',
        'b',
        'c',
      ]);
    });
  });
});
