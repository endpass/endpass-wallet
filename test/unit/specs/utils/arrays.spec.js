import { uniq, mapArrayByProp } from '@/utils/arrays';

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

  describe('mapArrayByProp', () => {
    it('should returns object with mapped values by given prop', () => {
      expect(
        mapArrayByProp(
          [
            {
              id: '0x0',
              foo: 'bar',
            },
            {
              id: '0x1',
              foo: 'baz',
            },
          ],
          'id',
        ),
      ).toEqual({
        '0x0': {
          id: '0x0',
          foo: 'bar',
        },
        '0x1': {
          id: '0x1',
          foo: 'baz',
        },
      });
    });

    it('should skip objects without given prop', () => {
      expect(
        mapArrayByProp(
          [
            {
              id: '0x0',
              foo: 'bar',
            },
            {
              foo: 'baz',
            },
          ],
          'id',
        ),
      ).toEqual({
        '0x0': {
          id: '0x0',
          foo: 'bar',
        },
      });
    });
  });
});
