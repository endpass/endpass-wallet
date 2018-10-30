import { merge } from '@/utils/objects';

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
});
