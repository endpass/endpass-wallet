import { isNumeric } from '@/utils/numbers';

describe('numbers utils', () => {
  describe('isNumeric', () => {
    it('should correctly validate numbers', () => {
      expect(isNumeric(1)).toBeTruthy();
      expect(isNumeric(1.1)).toBeTruthy();
      expect(isNumeric(Number.EPSILON)).toBeTruthy();
      expect(isNumeric('1')).toBeTruthy();
      expect(isNumeric('asd')).toBeFalsy();
      expect(isNumeric([])).toBeFalsy();
      expect(isNumeric(false)).toBeFalsy();
      expect(isNumeric({})).toBeFalsy();
    });
  });
});
