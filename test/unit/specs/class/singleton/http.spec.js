import { http } from '@/class';

describe('http', () => {
  describe('defaults', () => {
    const { defaults } = http;

    it('should have the correct timeout option', () => {
      expect(defaults.timeout).toBe(30000);
    });
  });
});
