import { merge, pick, pickBy } from '@/utils/objects';

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

  describe('pick', () => {
    it('should returns object entries for given keys', () => {
      expect(
        pick(
          {
            foo: 'bar',
            bar: 'baz',
            baz: 'foo',
          },
          ['foo', 'bar'],
        ),
      ).toEqual({
        foo: 'bar',
        bar: 'baz',
      });
    });
  });

  describe('pickBy', () => {
    it('should pick values by predicate', () => {
      expect(
        pickBy(
          {
            foo: {
              value: 1,
            },
            bar: {
              value: -1,
            },
            baz: {
              value: 3,
            },
          },
          ({ value }) => value > 0,
        ),
      ).toEqual({
        foo: {
          value: 1,
        },
        baz: {
          value: 3,
        },
      });
    });
  });
});
