import { merge, getFrom } from '@/utils/objects';

describe('objects utils', () => {
  describe('merge', () => {
    it('should returns one object from all entries', () => {
      expect(
        merge(
          {
            foo: 'bar',
          },
          {
            bar: 'baz',
          },
          {
            beep: 'bop',
          },
          {
            bop: 'beep',
          },
          {
            foo: 'fee',
          },
        ),
      ).toEqual({
        foo: 'fee',
        bar: 'baz',
        beep: 'bop',
        bop: 'beep',
      });
    });
  });

  describe('getFrom', () => {
    const obj = {
      foo: {
        bar: {
          baz: true,
        },
      },
    };

    it('should returns first not-null result from object by given paths', () => {
      expect(getFrom(obj, 'foo.bar.baz.boop', 'foo.bar.baz')).toBe(true);
      expect(getFrom(obj, 'foo.bar', 'foo.bar.baz')).toEqual({
        baz: true,
      });
    });

    it('should return null if nothing match to given paths', () => {
      expect(getFrom(obj, 'x', 'y', 'z')).toBeNull();
    });
  });
});
