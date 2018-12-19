import { asyncCheckProperty } from '@/utils';

describe('utils', () => {
  describe('asyncCheckProperty', () => {
    beforeAll(() => {
      jest.useRealTimers();
    });

    it('should resolves only values matches to predicate due changing', async () => {
      expect.assertions(1);

      const foo = {
        bar: 'beep',
      };
      const res = await asyncCheckProperty(foo, 'bar', v => v === 'beep', 100);

      expect(res).toBe('beep');
    });
  });
});
